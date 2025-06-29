const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const userJson = require('./users.json');
const infosJson = require('./infos.json');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const users = userJson;
    infosJson.views += 1;

    await fs.writeFile('./infos.json', JSON.stringify(infosJson, null, 2));

    const usersData = await Promise.all(
      users.map(async (user) => {
        try {
          const response = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${user.id}`);

          if (!response.ok) {
            console.error(`Erro ao buscar perfil do usuário ${user.id}: ${response.statusText}`);
            return { error: `Erro ao buscar usuário ${user.id}` };
          }

          const data = await response.json();

          return {
            id: data.id,
            username: data.username,
            global_name: data.global_name,
            avatar_url: data.avatar?.link || null,
            banner_color: data.banner?.color || null,
            created_at: data.created_at
          };
        } catch (err) {
          console.error(`Erro ao processar usuário ${user.id}:`, err);
          return { error: `Erro ao processar usuário ${user.id}` };
        }
      })
    );

    res.render('index', { users: usersData, infos: infosJson });
  } catch (error) {
    console.error('Erro na rota /:', error);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(8081, () => {
  console.log('Servidor rodando em http://localhost:8081');
});