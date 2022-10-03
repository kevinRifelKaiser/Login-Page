//We can create an .env file in case we do not want to share our keys on github or others spaces when we upload our proyect. But in this case we are going to use de enviromental variables that Railway offer to us.
export const SECRET = process.env.SECRET;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;