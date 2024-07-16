const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Modules = require('../entities/modules')

exports.create = async (req, res, next) => {
    try {

        const libelle = req.body.titre
        const tarif = req.body.prix
        const points = req.body.points
        const data = req.data

        let photomodule = null
        if (req.files) {
            if ("photomodule" in req.files && req.files["photomodule"][0].filename != null) {
                photomodule = req.files["photomodule"][0].filename
            }
        }
        

        const modules = new Modules(libelle, new Date(), null, data.id_formateur, points, tarif, photomodule)
        const response = await modules.create()
        if (response == true) {
            res.status(201).json({ message: "Module créé avec succès." })
        } else if (response == 3) {
            res.status(200).json({ message: "Vous avez déjà créé ce module" })
        } else {
            res.status(500).json({ message: response })
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.getAllModulesOnFormateur = async (req, res) => {
    const data = req.data
    const modules = new Modules(null, null, null, data.id_formateur, null)

    const response = await modules.seeAllModulesOnFormateur(data.id_formateur)
    if (response) {
        res.status(201).json(response)
    } else {
        res.status(404).json([])
    }

}

exports.getAllModulesOnFormateurEtude = async (req, res) => {
    const id_formateur = req.body.id_formateur
    const modules = new Modules(null, null, null, id_formateur, null)

    const response = await modules.seeAllModulesOnFormateur(id_formateur)
    if (response) {
        res.status(201).json(response)
    } else {
        res.status(200).json([])
    }
}

exports.updatedmodule = async (req, res) => {
    try {
        const id_module = req.body.id_module
        const data = req.data
        const libelle = req.body.title
        const points = req.body.points
        const tarif = req.body.price

        let photomodule = null
        if (req.files) {
            if ("photomodule" in req.files && req.files["photomodule"][0].filename != null) {
                photomodule = req.files["photomodule"][0].filename
            }
        }
        console.log('Ca y est')
        console.log(id_module)
        console.log(data.id_formateur)
        console.log(libelle)
        console.log(points)
        console.log(tarif)
        console.log(photomodule)

        const modules = new Modules(null, null, null, data.id_formateur, null)
        const reponse = await modules.updatemodule(id_module, data.id_formateur, libelle, points, tarif, photomodule)
        if (reponse == 3){
            res.status(201).json("Vous avez déjà créé ce module")
        }else if(reponse == true){
            res.status(200).json("Modification effectuée avec succès")
        }else{
            res.status(500).json(reponse)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.deleteModules = async (req, res) => {
    const libelle = req.body.libelle
    const id_module = req.body.id_module
    const cours = new Modules(libelle, null, null, null)

    try {
        const response = await cours.deleteOneModules(id_module)
        if (response == true) {
            res.status(201).json("Cours supprimé")
        } else {
            res.status(404).json("Cours non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la suppression" })
    }
}

exports.affichertoutout = async (req, res) => {
    try{
        const modules = new Modules(null, null, null, null, null)
        const response = await modules.affichertoutout()

        res.status(200).json(response)
    }catch(error){

    }
}

exports.vewmodules = async (req, res) => {
    try{
        const id_module = req.body.id_module

        const modules = new Modules(null, null, null, null, null)
        const response = await modules.vewmodule(id_module)

        res.status(200).json(response)
    }catch(error){
        console.log(error)
    }
}
