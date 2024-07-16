const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Support_cours = require('../entities/support_cours')

exports.create = async (req, res, next) => {
    try {
        const type = req.body.type
        const id_module = req.body.id_module
        const nom = req.body.nom

        let supportcours = null
        if (req.files) {
            if ("supportcours" in req.files && req.files["supportcours"][0].filename != null) {
                supportcours = req.files["supportcours"][0].filename
            }
        }
        
        const support_cours = new Support_cours(type, supportcours, nom, new Date(), id_module)
        const response = await support_cours.create()
        
        if (response == true) {
            console.log(response)
            res.status(201).json({ message: "Support de cours créé avec succès." })
        } else {
            res.status(400).json({ message: response })
            console.log(response)
        }

    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.getAllSupport = async (req, res) => {
    try{
        const id_module = req.body.id_module

        const support_cours = new Support_cours(null, null, null, new Date(), null)
        const reponse = await support_cours.seeAllSupport(id_module)
        if(reponse == false){
            res.status(200).json("Aucun support de cours trouvé")
        }else{
            res.status(201).json(reponse)
        }
    }catch(error){
        res.status(500).json(error)
    }
}

exports.supprimersupport = async (req, res) => {
    try{
        const id_support_cours = req.body.id_support_cours

        const support_cours = new Support_cours(null, null, null, new Date(), null)
        const reponse = await support_cours.deleteSupport(id_support_cours)

        if(reponse == true){
            res.status(200).json('Supports de cours supprimé')
        }else{
            res.status(201).json('Support de cours non supprimé')
        }
    }catch(error){
        res.status(500).json(error)
    }
}
