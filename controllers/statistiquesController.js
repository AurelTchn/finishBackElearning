const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Statistiques = require('../entities/statistiques')

exports.nombre_apprenant_module = async (req, res, next) => {
    try {
        const data = req.data
        const statistiques = new Statistiques()
        const response = await statistiques.nombre_apprenant_modules(data.id_formateur)
        res.status(200).json(response)
        
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })    
    }
}

exports.nombre_module = async (req, res) =>{
    try{
        const data = req.data
        console.log(data)
        const statistiques = new Statistiques()
        const response = await statistiques.nombre_module_formateur(data.id_formateur)
        res.status(200).json(response)
    }catch(error){
        res.status(500).json(error)
    }
}

exports.nombre_commentaires = async (req, res) => {
    try{
        const data = req.data
        const statistiques = new Statistiques()
        const response = await statistiques.nombre_commentaire(data.id_formateur)
        
        res.status(200).json(response)
    }catch(error){
        console.log(error)
    }
}

exports.nombre_apprenant_par_modules = async (req, res) => {
    try{
        const data = req.data
        console.log(data)
        const statistiques = new Statistiques()
        const response = await statistiques.nombre_apprenant_par_module(data.id_formateur)

        res.status(200).json(response)
    }catch(errro){
        res.status(500).json(errro)
    }
}

exports.courbe_apprenants = async (req, res) => {
    try{
    
        const statistiques = new Statistiques()
        const response = await statistiques.courbe_apprenant()

        res.status(200).json(response)
    }catch(error){
        res.status(500).json(error)
    }
}

exports.courbe_formateurs = async (req, res) => {
    try{
    
        const statistiques = new Statistiques()
        const response = await statistiques.courbe_formateur()

        res.status(200).json(response)
    }catch(error){
        res.status(500).json(error)
    }
}

exports.rechercher = async (req, res) => {
    try{
        const namemodule = req.body.namemodule
        const namecourse = req.body.namecourse

        const statistiques = new Statistiques()
        const reponse = await statistiques.rechercher(namemodule, namecourse)

        res.status(200).json(reponse)

    }catch(error){
        res.status(400).json(error)
    }
}

exports.compter = async (req, res) => {
    try{
        const namemodule = req.body.namemodule
        const namecourse = req.body.namecourse

        const statistiques = new Statistiques()
        const response = await statistiques.compter(namemodule, namecourse)

        res.status(200).json(response)
    }catch(error){
        console.log(error)
    }
}

