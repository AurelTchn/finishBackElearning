const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Support_cours {
    constructor(type, contenu, nom, created_at = new Date(), id_module) {
        this.type = type
        this.contenu = contenu
        this.nom = nom
        this.created_at = created_at
        this.id_module = id_module
    }

    async create() {
        const [rows] = await db.execute(
            "INSERT INTO `support_cours`(`type`,`contenu`, `nom`, `created_at`,`id_module`) VALUES (?,?,?,?,?)",
            [this.type, this.contenu, this.nom, new Date(), this.id_module]
        )
        return true
    }

    async seeOneSupport(id_cours) {
        let sql = 'SELECT libelle FROM `cours` WHERE id_cours = ?'
        let [row] = await db.execute(sql, [id_cours])
        if (row.length > 0) {
            const nom_cours = row[0].libelle
            return nom_cours
        } else {
            return false
        }
    }

    async seeAllSupport(id_module) {
        let sql = 'SELECT * FROM `support_cours` WHERE id_module=? '
        let [rows] = await db.execute(sql, [id_module])
        if (rows.length > 0) {
            return rows
        } else {
            return false
        }
    }

    async deleteSupport(id) {
        try {
            let sql = 'DELETE FROM `support_cours` WHERE id_support_cours=? '
            let [rows] = await db.execute(sql, [id])
            return true
        }catch(error){
            console.log(error)
            return false
            
        }
        
    }
}

module.exports = Support_cours