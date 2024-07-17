const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Cours {
    constructor(libelle){
        this.libelle = libelle
    }

    async create() {
        let sql = 'SELECT * FROM `cours` WHERE libelle = ?'
        let [row] = await db.execute(sql, [this.libelle])
        if(row.length > 0){
            return 3
        }else{
            const [ rows ] = await db.execute(
                "INSERT INTO `cours`(`libelle`, `created_at`) VALUES (?,?)",
                [this.libelle, new Date()]
            )
            return true
        }
    }

    async seeOneCours(id_cours){
        let sql = 'SELECT libelle FROM `cours` WHERE id_cours = ?'
        let [row] = await db.execute(sql, [id_cours])
        if(row.length > 0){
            const nom_cours = row[0].libelle
            return nom_cours
        }else{
            return false
        }
    }

    async seeAllCours(){
        const allCours = []
        let sql = 'SELECT * FROM `cours` '
        let [rows] = await db.execute(sql)
        if(rows.length > 0){
            for(let row of rows){
                allCours.push(row)
            }
            return allCours
        }else{
            return false
        }
    }

    async deleteOneCours(id_cours){
        let sql = 'SELECT * FROM `cours` WHERE id_cours = ? '
        let [rows] = await db.execute(sql, [id_cours])
        if(rows.length > 0){
            let sql = 'DELETE FROM cours WHERE id_cours = ? '
            await db.execute(sql, [id])
            return true
        }else{
            return false
        }
    }

    async vewcours(id_formateur){
        try{
            

            const sql2 = "SELECT id_cours FROM formateur WHERE id_formateur=?"
            const [row2] = await db.execute(sql2, [id_formateur])

            const sql3 = "SELECT libelle FROM cours WHERE id_cours=?"
            const [row3] = await db.execute(sql3, [row2[0].id_cours])

            return row3[0].libelle
        }catch(error){
            console.log(error)
        }
    }
}

module.exports = Cours