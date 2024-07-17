const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')

const Cours = require('../entities/cours')

exports.create = async (req, res, next) => {
    try {
        const libelle = req.body.libelle
        console.log(libelle)
        const cours = new Cours(libelle)
        const response = await cours.create()
        if (response == true) {
            res.status(201).json("Cours créé avec succès.")
        } else if (response == 3) {
            res.status(200).json("Ce cours existe déjà")
        } else {
            res.status()
        }

    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.getAllCours = async (req, res) => {
    const libelle = req.body.libelle
    const cours = new Cours(libelle)

    const response = await cours.seeAllCours()
    if (response) {
        res.status(201).json(response)
    } else {
        res.status(404).json("Aucun cours trouvé")
    }

}

exports.getOneCours = async (req, res) => {
    const libelle = req.body.libelle
    const id_cours = req.body.id_cours
    const cours = new Cours(libelle)
    try {
        const response = await cours.seeOneCours(id_cours)
        if (response) {
            res.status(200).json(response)
        } else if (response == false) {
            res.status(404).json("Id non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'affichage" })
    }
}

exports.deleteCours = async (req, res) => {
    const libelle = req.body.libelle
    const cours = new Cours(libelle)

    try {
        const response = await cours.deleteOneCours(id_cours)
        if (response == true) {
            res.status(201).json("Cours supprimé")
        } else {
            res.status(404).json("Cours non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la suppression" })
    }
}

exports.viewcours = async (req, res) => {
    try {
        const id_module = req.body.id_module
        const cours = new Cours(null)
        const response = await cours.vewcours(id_module)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}