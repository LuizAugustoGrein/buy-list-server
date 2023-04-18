const jwt = require('jsonwebtoken')
const config = require('../../config')
import { User } from "@prisma/client";
import { prisma } from "../lib/prisma"

module.exports = async (
  req: { headers: { [x: string]: any; }; usuarioLogado: User; }, 
  res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { message: string; }): void; new(): any; }; }; }, 
  next: () => void) => {
  let token = req.headers['x-access-token']
  if (token) {
    try {
      let decoded = jwt.verify(token, config.secretKey)
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.user.id
        },
      })
      if(!user) {
        res.status(401).send({
          message: 'O token informado é inválido!'
        })
        return;
      }
      req.usuarioLogado = user
      next()
    } catch (error) {
      res.status(401).send({
        message: 'O token informado é inválido!'
      })
    }
  } else {
    res.status(401).send({
      message: 'Você precisa informar um token para acessar este recurso!'
    })
  }
};