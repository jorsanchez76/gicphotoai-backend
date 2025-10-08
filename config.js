module.exports = {
  //port
  PORT: process.env.PORT || 3002, // Different port from flirtzy-backend

  //secret key for API
  SECRET_KEY: "lPhXzI3Fv;TF(>R",

  //secret key for jwt
  JWT_SECRET: "XtC9fWcBSf",

  //baseUrl for local development
  baseURL: "http://143.110.141.92:3002/",
  
  //SQLite database path
  DB_PATH: "./gicphotoai.db",

  //firebase server key for notification (same as original)
  SERVER_KEY: "AAAA4LFLVd0:APA91bFPLs9GOXoiRvlIf044DAvkGQkK_lsqu7tjb5_ygA2pmJr20TAEWn9R_EG3xEzy94_m2k03Rus6y1JvqykemWfLfeOePEr2JvGi0ks7eMfUwhm8aRTpulPgNydyQXmUdgd4laJr",
};