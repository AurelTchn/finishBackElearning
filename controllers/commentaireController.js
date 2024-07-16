const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Commentaire = require('../entities/commentaire')

exports.create = async (req, res, next) => {
    try {
        const texte = req.body.texte
        const data = req.data
        const id_module = req.body.id_module
        const rating = req.body.rating

        const commentaire = new Commentaire(texte, rating, new Date(), data.id_apprenant, id_module)
        const response = await commentaire.create()
        if (response == true) {
            res.status(201).json("Commentaire créé avec succès.")
        } else {
            res.status(400).json(response)
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.getOneCommentaire = async (req, res) => {
    const texte = req.body.texte
    const id_apprenant = req.body.id_apprenant
    const id_module = req.body.id_module

    const commentaire = new Commentaire(texte, new Date(), id_apprenant, id_module)
    try {
        const response = await commentaire.seeOneCommentaire(id_apprenant, id_module)
        if (response) {
            res.status(200).json(response)
        } else if (response == false) {
            res.status(404).json("Id non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'affichage" })
    }
}

exports.deleteApprenant = async (req, res) => {
    const texte = req.body.texte
    const id_apprenant = req.body.id_apprenant
    const id_module = req.body.id_module

    const commentaire = new Commentaire(texte, new Date(), id_apprenant, id_module)

    try {
        const response = await commentaire.deleteOneCommentaire(id_apprenant, id_module)
        if (response == true) {
            res.status(201).json("Commentaire supprimé")
        } else {
            res.status(404).json("Commentaire non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la suppression" })
    }
}

exports.afficherAllCommentaire = async (req, res) => {
    const id_module = req.body.id_module
    const commentaire = new Commentaire(null, null, new Date(), null, id_module)
    const response = await commentaire.getAllCommentaire()
    if(response == false){
        res.status(200).json([])
    }else {
        res.status(201).json(response)
    }
}