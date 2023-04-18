import express from 'express'
import cors from 'cors'
const jwt = require('jsonwebtoken')
const config = require('../config')
import { knex } from "./lib/knex"
import dayjs from "dayjs"
import axios from 'axios';


const PORT = process.env.PORT || 3333

const HOSTNAME = process.env.HOSTNAME || 'http://localhost'

const app = express()

app.use(cors())

app.use(express.json())

//const auth = require('./middlewares/authentication')

app.post('/users', async (req, res, _next) => {
  var data = req.body;

  if (
    !data.email ||
    !data.name ||
    !data.user ||
    !data.password
  ) {
    res.status(400).send({
      msg: "campos obrigatorios nao preenchidos"
    })
    return;
  }

  const userExists = await knex.select('id')
    .from('users')
    .where({ email: data.email })

  if (userExists[0]) {
    res.status(400).send({
      msg: "usuario ja existente"
    })
    return;
  }

  knex('users').insert(
    { 
      user: data.user,
      name: data.name,
      email: data.email,
      password: data.password
    }
  ).then( async () => {
    var token = jwt.sign(
      {
        user: data.user,
        password: data.password
      },
      config.secretKey
    )

    const createdUser = await knex.select('id')
    .from('users')
    .where({ email: data.email })

    knex('authentications').insert(
      {
        user_id: createdUser[0].id,
        token: token
      }
    ).then(() => {
      res.send({
        token: token
      })
    })
  })
})

app.post('/users/token', async (req, res, _next) => {
  var data = req.body;

  if (!data.token) {
    res.status(400).send({
      msg: "campos obrigatorios nao preenchidos"
    })
    return;
  }

  var login = false;

  const authentications = await knex.select('id')
    .from('authentications')
    .where({ token: data.token })

  if (authentications[0]) {
    login = true;
  } else {
    login = false;
  }

  res.send({
    login: login
  })

});

// 1 - CRIACAO DE USUARIO
/*app.post('/user', async (req, res, _next) => {
  try {
    var data = req.body

    if (
      !data.email ||
      !data.name ||
      !data.user ||
      !data.password
    ) {
      res.status(400).send({
        msg: "campos obrigatorios nao preenchidos"
      })
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email: data.email
      },
    })

    if (userExists) {
      res.status(400).send({
        msg: "usuario ja existente"
      })
      return;
    }

    const today = dayjs().toDate()

    var baseUrl = "http://www.triio.com.br/api/Usuarios.php?Metodo=InserirUsuario"
    baseUrl += `&user=${data.user}`
    baseUrl += `&password=${data.password}`
    baseUrl += `&email=${data.email}`
    baseUrl += `&created_at=${today}`
    baseUrl += `&CEP=${data.cep}`
    baseUrl += `&Logradouro=${data.street}`
    baseUrl += `&Bairro=${data.district}`
    baseUrl += `&Numero=${data.number}`
    baseUrl += `Complemento=${data.complement}`
    baseUrl += `Cidade=${data.city_code}`

    axios.post(baseUrl).then(async function(response) {
      console.log(response);
      if (response.data[0]['Codigo']) {
        await prisma.user.create({
          data: {
            user: data.user,
            password: data.password,
            email: data.email,
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement,
            district: data.district,
            city_code: data.city_code,
            club_id: data.club_id,
            external_id: response.data[0]['Codigo'],
            created_at: today
          }
        })

        const newUser = await prisma.user.findUnique({
          where: {
            email: data.email
          },
        })

        var token = jwt.sign(
          {
            user: {
              id: newUser?.id,
              user: data.user,
              password: data.password,
              email: data.email
            }
          },
          config.secretKey
        )

        await prisma.authentication.create({
          data: {
            user_id: (newUser) ? newUser.id : '',
            token: token,
            created_at: today
          }
        })

        res.status(201).send({
          token: token,
          id: newUser?.id
        })
      }
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      msg: error
    })
  }
})*/

app.use((_req, res) => {
    res.status(404)
})

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`)
})