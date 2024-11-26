const axios = require('axios').default;
const format = require('date-format');

class Pedido {
    urlApi = process.env.PEDIDO_URL_API;
    apiKey = process.env.GATEWAY_ACCESS_KEY;

    async getPedido(id) {
        const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };
        // const response = await axios.get(`${this.urlApi}/${id}`, { headers });
        return await axios.get(`${this.urlApi}/${id}`, { headers });
    }

    formatPedido(response) {
        let table = `| **DATA DA TRANSAÇÃO** | **CÓDIGO DA TRANSAÇÃO** | **STATUS DO PEDIDO** | **ID DO CLIENTE** | **ID DO PRODUTO** \n\n`;
        if (Array.isArray(response)) {
            response.forEach(element => {
                table += `| **${format("dd/MM/yyyy", new Date(element.idCliente))}** | **${element.idOrder}** | **R$ ${element.status}** | **${element.idCliente}** | **${response.idProduto}\n\n`;
            });
        } else {
            table += `| **${format("dd/MM/yyyy", new Date(response.dataTransacao))}** | **${response.idOrder}** | **${response.status}** | **${response.idCliente}** | **${response.idProduto}** \n\n`;
        }
    
        return table;
    }
}    

module.exports.Pedido = Pedido;
