const Robot = require('../models/entity/Robot');
const History = require('../models/entity/History');
const { historyService } = require('../services/history.service');

exports.getRobots = async (req, res) => {
    try {
        const robots = await Robot.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'histories',
                    localField: '_id',
                    foreignField: 'robotId',
                    as: 'histories'
                }
            },
            {
                $addFields: {
                    totalPiecesPalatize: {
                        $sum: {
                            $map: {
                                input: "$histories",
                                as: "history",
                                in: { $toInt: "$$history.palatizedPieces" }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    "reference": 1,
                    "ip_robot": 1,
                    "nombre_pieces": 1,
                    "totalPiecesPalatize": { $ifNull: ["$totalPiecesPalatize", 0] },
                    "user._id": 1,
                    "user.nom": 1,
                    "user.prenom": 1,
                    "user.email": 1,
                    "user.password": 1,
                    "user.role": 1
                }
            }
        ]);

        //"user.password": { $ifNull: ['$user._id', null] },
        res.json(robots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un robot par son ID
exports.getRobotById = async (req, res) => {
    try {
        const robot = await Robot.findById(req.params.id);
        if (robot) {
            res.json(robot);
        } else {
            res.status(404).json({ message: "Robot not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRobot = async (req, res) => {
    try {
        const existingRobot = await Robot.findOne({ reference: req.body.reference });
        if (existingRobot) {
            return res.status(400).json({ message: "Un autre robot existe déjà avec cette référence." });
        }
        console.log('##', {
            reference: req.body.reference,
            userId: req.body.userId,
            ip_robot: req.body.ip_robot,
            nombre_pieces: req.body.nombre_pieces
        });
        const robot = new Robot({
            reference: req.body.reference,
            userId: req.body.userId,
            ip_robot: req.body.ip_robot,
            nombre_pieces: req.body.nombre_pieces
        });
        const newRobot = await robot.save();

        res.status(201).json(newRobot);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Une erreur s'est produite lors de la création du robot." });
    }
};



// Mettre à jour un robot par son ID
exports.updateRobot = async (req, res) => {
    try {
        const existingRobot = await Robot.findOne({ _id: req.params.id });
        if (!existingRobot) {
            return res.status(404).json({ message: "Le robot spécifié n'existe pas." });
        }
        // Mettre à jour les champs du robot selon les données fournies dans la requête
        if (existingRobot.reference) { existingRobot.reference = req.body.reference; }

        existingRobot.userId = req.body.userId;
        existingRobot.ip_robot = req.body.ip_robot;
        existingRobot.nombre_pieces = req.body.nombre_pieces;

        const updatedRobot = await existingRobot.save();
        return res.status(200).json(updatedRobot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un robot par son ID
exports.deleteRobot = async (req, res) => {
    try {
        const result = await Robot.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            historyService.deleteMany(req.params.id);
            res.json({ message: "Robot deleted" });
        } else {
            res.status(404).json({ message: "Robot not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

