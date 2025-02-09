require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

// Carregue as variáveis de ambiente do .env
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_API_SECRET;
const gatewayURL = process.env.PINATA_GATEWAY_URL;

// Inicialize o Pinata SDK
const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);

/**
 * Função para fazer upload de um arquivo para o IPFS usando Pinata.
 *
 * @param {string} filePath Caminho completo para o arquivo que você deseja fazer upload.
 * @returns {Promise<string>} Uma Promise que resolve com o CID do arquivo no IPFS ou rejeita com um erro.
 */
async function uploadToIPFS(filePath) {
    try {
        // Verifique se as chaves da API Pinata estão configuradas
        if (!pinataApiKey || !pinataSecretApiKey) {
            throw new Error("As chaves da API Pinata (PINATA_API_KEY e PINATA_API_SECRET) não estão configuradas no arquivo .env.");
        }

        // Verifique se o arquivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }

        // Crie um ReadableStream do arquivo
        const readableStreamForFile = fs.createReadStream(filePath);

        const options = {
            pinataMetadata: {
                name: path.basename(filePath), // Use o nome do arquivo como nome no IPFS
                // Você pode adicionar metadados adicionais aqui, se necessário
            },
            pinataOptions: {
                cidVersion: 0 // Opcional: Define a versão do CID (0 ou 1). 0 é mais comum.
            }
        };

        // Faça o upload do arquivo para o IPFS usando Pinata
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        
        console.log('Arquivo enviado para IPFS com sucesso!');
        console.log('ipfsCID: ', result.IpfsHash);

        return gatewayURL+result.IpfsHash; // Retorna o CID do arquivo

    } catch (error) {
        console.error("Erro ao fazer upload para o IPFS:", error);
        throw error; // Rejeita a Promise com o erro
    }
}

// Exemplo de uso da função (para testar o serviço)
async function main() {
    // Defina o caminho para o arquivo que você deseja fazer upload
    const fileToUploadPath = path.join(__dirname, 'metadataNFTree'); // Supondo que você tenha um arquivo exemplo.txt neste diretório

    // Crie um arquivo de exemplo se ele não existir
    if (!fs.existsSync(fileToUploadPath)) {
        fs.writeFileSync(fileToUploadPath, 'Este é um arquivo de exemplo para upload no IPFS.');
        console.log(`Arquivo de exemplo "${fileToUploadPath}" criado.`);
    }

    try {
        const cid = await uploadToIPFS(fileToUploadPath);
        console.log(`CID retornado: ${cid}`);
        // Você pode usar o CID retornado para armazenar em um banco de dados,
        // retornar em uma API, ou usar em sua aplicação.
        return cid;
    } catch (error) {
        console.error("Falha no upload do arquivo:", error);
    }
}

// Execute a função principal se este arquivo for executado diretamente
if (require.main === module) {
    main();
}

// Se você quiser exportar a função para usar em outros módulos:
module.exports = { uploadToIPFS };