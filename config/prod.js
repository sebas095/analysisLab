module.exports = {
  db: {
    url: "mongodb://" +
      process.env.MONGODB_PORT_27017_TCP_ADDR +
      ":" +
      process.env.MONGODB_PORT_27017_TCP_PORT +
      "/analysislab"
  },
  secret: "c8f5f276-02b9-451c-833f-6ea3da52b343",
  url: "http://sirius.utp.edu.co/labaguasyalimentos"
};
