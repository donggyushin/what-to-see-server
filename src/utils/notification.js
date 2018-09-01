import mysql from "../db/mysql";

export const createNotification = (other, you) => {
  const sql = "INSERT INTO notification(other, you) VALUES (?,?)";
  const post = [other, you];

  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
    }
    console.log("Success");
  });
};
