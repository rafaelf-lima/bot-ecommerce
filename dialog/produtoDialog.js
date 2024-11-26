const { MessageFactory } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');
const { ProdutoProfile } = require('../produtoProfile');
const {Produto} = require("../produto");
const { Extrato } = require('../extrato');
const { Categoria } = require('../categoria');
const { Pedido } = require('../pedido');

const NAME_PROMPT = 'NAME_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const PRODUCT_PROFILE = 'PRODUCT_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class ProductDialog extends ComponentDialog {
    constructor(userState) {
        super('productDialog');

        this.productProfile = userState.createProperty(PRODUCT_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.menuStep.bind(this),
            this.productNameStep.bind(this),
            this.productFilterStep.bind(this), // Nova etapa
            this.confirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async menuStep(step) {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Escolha a opção desejada',
            choices: ChoiceFactory.toChoices(['Consultar Pedidos', 'Consultar Produtos', 'Extrato de Compras'])        });
    }

    async productNameStep(step) {
        step.values.choice = step.result.value;
    
        switch (step.values.choice) {
            case "Consultar Pedidos": {
                return await step.prompt(NAME_PROMPT, 'Digite o número da transação'); 
            }
            case "Extrato de Compras": {
                return await step.prompt(NAME_PROMPT, 'Digite o ID do cartão');        
            }
            case "Consultar Produtos": {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Como você gostaria de consultar os produtos?',
                    choices: ChoiceFactory.toChoices(['Por categoria', 'Por nome'])
                });
            }
            default: {
                await step.context.sendActivity('Opção inválida. Tente novamente.');
                return await this.menuStep(step); // Go back to the menu
            }
        }
    }
    
    async productFilterStep(step) {
        // Check if the user's choice is "Consultar Produtos"
        if (step.values.choice !== "Consultar Produtos") {
            // Directly call confirmStep if the choice is not valid
            return await this.confirmStep(step);
        }
    
        // Proceed with filtering logic if the choice is valid
        step.values.filterType = step.result.value;
    
        if (step.values.filterType === 'Por categoria') {
            return await step.prompt(NAME_PROMPT, 'Digite o nome da categoria:');
        } else {
            return await step.prompt(NAME_PROMPT, 'Digite o nome do produto:');
        }
    }

    async confirmStep(step) {
        step.values.id = step.result;
        switch (step.values.choice) {
            case "Consultar Pedidos": {
                let id = step.values.id;
                let pedido = new Pedido();
                let response = await pedido.getPedido(id);
                let result = pedido.formatPedido(response.data);
                let message = MessageFactory.text(result);
                await step.context.sendActivity(message);
                break;
            }
            case "Extrato de Compras": {
                // let variavel = 1
                let id = step.values.id;
                let extrato = new Extrato();
                let response = await extrato.getExtrato(id);
                let result = extrato.formatExtrato(response.data);
                let message = MessageFactory.text(result);
                await step.context.sendActivity(message);
                break;
            }
            case "Consultar Produtos": {
                const categoria = new Categoria();
                const filterType = step.values.filterType; // Get the filter type
                const query = step.values.id; // Use the id as the query (it should be the category or product name)
    
                if (filterType === 'Por categoria') {
                    // Chama o método para buscar produtos por categoria
                    const response = await categoria.getCategoria(query); // Use query here
    
                    if (response.data && response.data.length > 0) {
                        const cards = categoria.createCategoryCards(response.data); // Cria cartões para os produtos
                        await step.context.sendActivity({ attachments: cards });
                    } else {
                        await step.context.sendActivity('Nenhum produto encontrado para esta categoria.');
                    }
                } else {
                    const produto = new Produto();
                    const response = await produto.getProduto(query); // Use query here
    
                    if (response.data && response.data.length > 0) {
                        const card = produto.createProductCard(response.data[0]); // Cria o cartão para o primeiro produto encontrado
                        await step.context.sendActivity({ attachments: [card] });
                    } else {
                        await step.context.sendActivity('Nenhum produto encontrado com este nome.');
                    }
                }
                break;
            }
        }
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.endDialog();
    }
}

module.exports.ProductDialog = ProductDialog;