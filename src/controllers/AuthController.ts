import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/pwdUtils";

import { generateToken } from "../utils/JWTUtils";
import Utilisateur from "../models/Utilisateur.model";

export async function register(req: Request, res: Response) {
    try {
        const { nom, email, password } = req.body;

        // 🚨 Vérification des champs obligatoires
        if (!nom || !email || !password) {
            res.status(400).json({ message: "Les champs nom, email et password sont obligatoires." });
            return
        }

        // 🔒 Hash du mot de passe
        const hashedPassword = await hashPassword(password);

        // ✅ Création d'un nouvel utilisateur en Sequelize
        const newUser = await Utilisateur.create({
            nom,
            email,
            hashedPassword, // Stocke le mot de passe hashé
        });

        // 🔍 Suppression du hash avant envoi
        const userResponse = { ...newUser.get(), password: undefined };

        res.status(201).json({ message: "Utilisateur créé avec succès", user: userResponse });
    } catch (err: any) {
        // 🚨 Gestion des erreurs (ex: email déjà existant)
        if (err.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({ message: "Email ou nom déjà existant." });
            return
        }
        console.error("Erreur lors de l'inscription :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        // Vérification des champs obligatoires
        if (!email || !password) {
            res.status(400).json({ message: "Champs email et password obligatoires" });
            return
        }

        // Recherche de l'utilisateur avec Sequelize
        const user = await Utilisateur.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return
        }

        // Vérification du mot de passe avec bcrypt
        const isPasswordValid = await verifyPassword(password, user.hashedPassword)

        if (!isPasswordValid) {
            res.status(401).json({ message: "Mot de passe invalide" });
            return
        }

        // 🔑 Génération du token JWT
        const token = generateToken({ id: user.id })

        // Stocker le token dans un cookie sécurisé
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.status(200).json({ message: "Login réussi !" });
    } catch (err: any) {
        console.error("Erreur lors de l'authentification :", err);
        res.status(500).json({ message: err.message });
    }
} 