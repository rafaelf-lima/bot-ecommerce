const axios = require('axios').default;
const format = require('date-format');

class Pedido {
    urlApi = process.env.EXTRATO_URL_API;
    apiKey = process.env.GATEWAY_ACCESS_KEY;

    async getPedido(id) {
        const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };

        return await axios.get(`${this.urlApi}/${id}`, { headers });
    }

    formatPedido(response) {
        let table = `| **DATA DA TRANSAÇÃO** | **COMERCIANTE** | **VALOR** |\n\n`;
        if (Array.isArray(response)) {
            response.forEach(element => {
                table += `| **${format("dd/MM/yyyy", new Date(element.dataTransacao))}** | **${element.comerciante}** | **R$ ${element.valor.toFixed(2)}** |\n\n`;
            });
        } else {
            table += `| **${format("dd/MM/yyyy", new Date(response.dataTransacao))}** | **${response.comerciante}** | **R$ ${response.valor.toFixed(2)}** |\n\n`;
        }
    
        return table;
    }
}    

module.exports.Pedido = Pedido;
