const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db


const Recu = require('../entities/recu')

exports.create = async (req, res, next) => {
    try {
        const date_recu = req.body.date_recu
        const montant_recu = req.body.montant_recu
        const id_module = req.body.id_module
        const id_apprenant = req.body.id_apprenant
        const data = req.data

        console.log(montant_recu)
        console.log(id_module)
        console.log(id_apprenant)
        const recu = new Recu(new Date(), montant_recu, id_module, data.id_apprenant)
        const response = await recu.create()
        if (response == true) {
            res.status(201).json("Reçu créé avec succès.")
        } else {
            res.status(400).json(":( erreur")
        }

    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.afficherToutRecu = async (req, res) => {
    const data = req.data
    const recu = new Recu(new Date(), null, null, data.id_apprenant)
    const response = await recu.getAllRecu( data.id_apprenant)
    res.status(200).json(response)
}