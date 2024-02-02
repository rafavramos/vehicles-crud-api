# README

Este repositório contém uma aplicação que utiliza Node.js, npm e Docker para criar um ambiente de desenvolvimento local. Siga os passos abaixo para configurar e executar a aplicação:

## Pré-requisitos
- Node.js e npm instalados
- Docker e Docker Compose instalados

## Passos para Configuração

1. **Instale as dependências:**
   ```bash
   npm install
2. **Inicie os containers do Docker:**
   ```bash
   docker compose up
3. **Inicie a aplicação:**
   ```bash
   npm run start
   
Após seguir esses passos, o ambiente de desenvolvimento estará configurado e a aplicação estará em execução.

## Acesse a Documentação da API
![image](https://github.com/rafavramos/vehicles-crud-api/assets/81692502/7bad163f-0394-4053-935c-1938b747fd16)

Para acessar a documentação da API, abra seu navegador e vá para o seguinte endereço:

http://localhost:{PORTA_UTILIZADA}/doc

Certifique-se de substituir {PORTA_UTILIZADA} pela porta específica utilizada pela aplicação no seu ambiente local.

## Documentação

Para utilizar a API você deve antes registrar um usuário;

Após registrar um usuário fazer login na routa de auth;

Para utilizar as outras rotas da api, sempre será necessário informar no campo Authorization o token retornado do login da seguinte forma: Bearear <aqui_colocar_o_token>;

## Observações técnicas

Para simplificar a estrutura de tabelas foi criado um arquivo init.sql que é executado ao subir o container do postgres;

Foi utilizado Typescript e Express para construção da Api, além de algumas outras libs auxiliares;




