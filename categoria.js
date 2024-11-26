const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Categoria {

    urlApi = process.env.PRODUTO_URL_API;
    apiKey = process.env.GATEWAY_ACCESS_KEY;

    /**
     * Obtém os produtos pertencentes a uma categoria específica.
     * @param {string} nomeCategoria 
     * @returns {Promise} 
     */
    async getCategoria(nomeCategoria) {
        const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };
        return await axios.get(`${this.urlApi}/categoria/${nomeCategoria}`, {headers: headers});
    }

    /**
     * Cria cartões para exibição de produtos na categoria.
     * @param {Array} produtos 
     * @returns {Array} 
     */
    createCategoryCards(produtos) {
        return produtos.map(produto => 
            CardFactory.thumbnailCard(
                produto.productName,
                [{ url: produto.urlFoto }],
                [],
                {
                    subtitle: `Preço: ${produto.preco}`,
                    text: produto.descricaoProduto
                }
            )
        );
    }
}

module.exports.Categoria = Categoria;
