const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Produto {

    urlApi = process.env.PRODUTO_URL_API;
    apiKey = process.env.GATEWAY_ACCESS_KEY;

    async getProduto(nomeProduto) {
        const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };
        return await axios.get(`${this.urlApi}?nomeProduto=${nomeProduto}`, {headers: headers});
    }
    createProductCard(response) {
        return CardFactory.thumbnailCard(
            response.productName,
            [{ url: response.urlFoto }],
            [],
            {
                subtitle: `Preço do produto: R$ ${response.preco}`,
                text: response.descricaoProduto
            }
        );
    }
}

module.exports.Produto = Produto;