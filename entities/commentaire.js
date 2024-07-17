const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Commentaire {
    constructor(texte, rating, created_at = new Date(), id_apprenant, id_module) {
        this.texte = texte
        this.rating = rating
        this.created_at = created_at
        this.id_apprenant = id_apprenant
        this.id_module = id_module
    }

    async create() {
        try {
            const [rows] = await db.execute(
                "INSERT INTO `commentaire`(`texte`, `rating`, `created_at`, `id_apprenant`, `id_module`) VALUES (?,?,?,?,?)",
                [this.texte, this.rating, this.created_at, this.id_apprenant, this.id_module]
            )
            return true
        } catch (error) {
            return error
        }
    }

    async getAllCommentaire() {
        const allComments = []
        let sql = 'SELECT * FROM `commentaire` WHERE id_module=? GROUP BY id_apprenant '
        let [rows] = await db.execute(sql, [this.id_module])
        console.log(rows)
        if (rows.length > 0) {
            for (let row of rows) {
                console.log("hdfjdf")
                console.log(row)
                allComments.push(await this.seeOneCommentaire(row.id_apprenant, row.id_module))
            }
            const envoye = []
            for (let comment of allComments){
                for(let com of comment){
                    envoye.push(com)
                }
            }
            return envoye
        } else {
            return false
        }
    }

    async seeOneCommentaire(id_apprenant, id_module) {
        let sql = 'SELECT * FROM `commentaire` WHERE id_apprenant = ? AND id_module = ? ORDER BY id_commentaire DESC'
        let [row] = await db.execute(sql, [id_apprenant, id_module])
        const result = []
        if (row.length > 0) {
            for (let ro of row) {
                let sql1 = "SELECT prenom, photo FROM apprenant WHERE id_apprenant = ?"
                let [row1] = await db.execute(sql1, [id_apprenant])

                const prenom_appr = row1[0].prenom
                const photo_appr = row1[0].photo
                result.push( {
                    id_commentaire: ro.id_commentaire,
                    prenom: prenom_appr,
                    texte: ro.texte,
                    rating: ro.rating,
                    created_at: ro.created_at,
                    photo: photo_appr
                })
            }

            return result
        } else {
            return false
        }
    }

    async deleteOneCommentaire(id_apprenant, id_module) {
        let sql = 'SELECT * FROM `commentaire` WHERE id_apprenant = ? AND id_module= ? '
        let [rows] = await db.execute(sql, [id_apprenant, id_module])
        if (rows.length > 0) {
            let sql = 'DELETE FROM commentaire WHERE id_apprenant = ? AND id_module= ? '
            await db.execute(sql, [id_apprenant, id_module])
            return true
        } else {
            return false
        }
    }

}

module.exports = Commentaire