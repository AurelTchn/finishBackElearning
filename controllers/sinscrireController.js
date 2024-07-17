const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const SinscrireAmodule = require('../entities/sinscrireAmodule')

exports.create = async (req, res, next) => {
    try {
        const id_module = req.body.id_module
        const data = req.data
        const montantpaye = req.body.montantpaye

        console.log(id_module)
        console.log(data)
        console.log(montantpaye)

        const sinscrireAmodule = new SinscrireAmodule(id_module, data.id_apprenant, new Date(), montantpaye)
        const response = await sinscrireAmodule.create()
        if (response == true) {
            res.status(201).json("Inscription créée avec succès.")
        } else {
            res.status(400).json(":( erreur")
        }

    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.verif_iscri_module = async (req, res) => {
    try{
        const id_module = req.body.id_module
        const data = req.data

        console.log(id_module)
        console.log(data)

        const sinscrireAmodule = new SinscrireAmodule(id_module, data.id_apprenant, new Date(), null)
        const response = await sinscrireAmodule.verif_inscr_module()

        if(response == true){
            res.status(200).json(true)
        }else{
            res.status(201).json(false)
        }
    }catch(error){
        console.log(error)
    }
}