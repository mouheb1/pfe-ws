const History = require('../models/entity/History');
const Robot = require('../models/entity/Robot');
const User = require('../models/entity/User');
const { clientService } = require('../services/client.service');
const { historyService } = require('../services/history.service');

exports.getAllLengthCollections = async (req, res) => {
  try {
    const histories = await historyService.selectAll();
    const robots = await Robot.find();

    let totalPieces = 0;
    robots.forEach(robot => { totalPieces += robot.nombre_pieces; });

    let piecesPalatizes = 0;
    histories.forEach(hitory => { piecesPalatizes += parseFloat(hitory.palatizedPieces); });

    return res.json({
      countRobots: clientService.selectAllRobots().length,
      robotsReference: clientService.selectAllRobots()?.map(robot => robot.username) || [],
      countUsers: clientService.selectAllUsers().length,
      totalNombrePieces: totalPieces,
      totalNombrePiecesPalatizes: piecesPalatizes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getrobotStats = async (req, res) => {
  try {
    const { reference, userId } = req.query || {}

    if (!reference && !userId) {
      return res.status(400).json({ message: 'you need to specify a reference or a userId' })
    }

    const filter = reference ? { reference } : { userId };

    const robot = await Robot.findOne(filter)

    if (!robot) {
      return res.status(404).json({ message: 'robot not found' })
    }

    const history = await History.findOne({
      robotId: robot._id
    });

    const user = await User.findById(robot.userId);

    return res.status(200).json({ history, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

