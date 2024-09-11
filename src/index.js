const express = require("express");
const session = require("express-session");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(session({ secret: "whatever" }));

const secret = speakeasy.generateSecret({
  length: 20,
});

app.get("/generate", async (req, resp) => {
  try {
    req.session.secretCode = secret.base32; 
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      encoding: "base32",
      issuer: "TestApp",
      label: "my@email",
    });
    const qrCode = await qrcode.toDataURL(url);
    // you can then display the QR by adding'<img src="' + imageUrl + '">'
    resp.send({ qrCode, token });
  } catch (err) {
    console.log(err);
  }
});

app.post("/verify", (req, res) => {
  const token = req.body.token; // OTP entered by the user
  const verified = speakeasy.totp.verify({
      secret: req.session.secretCode,
      encoding: 'base32',
      window: 1,
      token,
    });
if (verified) {
    res.send({
      status: "OTP verified successfully.",
    });
  } else {
    res
      .status(401)
      .send({ status: "OTP verification failed." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
