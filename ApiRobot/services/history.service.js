const ResponseStatus = require("../enum/ResponseStatus");
const MsgReponseStatus = require("../models/Response/MessageResponse");
const Robot = require("../models/entity/Robot");
const History = require('../models/entity/History');
const { ObjectId } = require("mongodb");


getAllHistory = async () => {
  return await History.aggregate([
    {
      $lookup: {
        from: 'robots',
        localField: 'robotId',
        foreignField: '_id',
        as: 'robot'
      }
    },
    {
      $unwind: {
        path: '$robot',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        "timestamp": 1,
        "palatizedPieces": 1,
        "robot":
        {
          "_id": 1,
          "reference": 1,
          "ip_robot": 1,
          "nombre_pieces": 1
        }
      }
    }
  ]);
};


addHistory = async (dataRobot) => {
  const existingRobot = await Robot.findOne({ reference: dataRobot.reference });
  if (!existingRobot) {
    return MsgReponseStatus.builder()
      .setTitle("Error Message")
      .setDatestamp(new Date())
      .setStatus(ResponseStatus.ERROR)
      .setMessage("cannot find existing robot")
      .build();
  }
  const historySource = await History.findOne({
    robotId: existingRobot._id
  });
  let history
  if (historySource) {
    const palatizedPieces = historySource.palatizedPieces + 1
    const completedPallets = Math.floor(palatizedPieces / 100)

    if (palatizedPieces > historySource.totalPieces) {
      return MsgReponseStatus.builder()
        .setTitle("Error Message")
        .setDatestamp(new Date())
        .setStatus(ResponseStatus.ERROR)
        .setMessage("all pieces are palatized")
        .build();
    }

    history = await History.findByIdAndUpdate(historySource._id, {
      ...history,
      palatizedPieces,
      completedPallets,
      totalExecutionDuration: palatizedPieces * 10, // each iteration take 10 seconds
      palatizeExecutionDuration: completedPallets * 10 * 100 // each palate have 100 piece and each piece take 10 sc 
    }, { new: true });

  } else {
    history = new History({
      _id: new ObjectId(),
      robotId: existingRobot._id,
      palatizedPieces: 1,
      totalPieces: existingRobot.nombre_pieces,
      timestamp: dataRobot.timestamp
    });
    await history.save();
  }
  return MsgReponseStatus.builder()
    .setTitle("Success Message")
    .setDatestamp(new Date())
    .setStatus(ResponseStatus.SUCCESSFUL)
    .setMessage("successfully created history ")
    .build();
};

deleteManyHistory = async (robotId) => {
  result = await History.deleteMany({ robotId: robotId });
  if (result.deletedCount > 0) {
    return MsgReponseStatus.builder()
      .setTitle("Success Message")
      .setDatestamp(new Date())
      .setStatus(ResponseStatus.ERROR)
      .setMessage("successfully deleted history by robotId")
      .build();
  }
  return MsgReponseStatus.builder()
    .setTitle("Error Message")
    .setDatestamp(new Date())
    .setStatus(ResponseStatus.SUCCESSFUL)
    .setMessage("cannot delete Many History")
    .build();
};


module.exports = { historyService: { insert: addHistory, selectAll: getAllHistory, deleteMany: deleteManyHistory } };