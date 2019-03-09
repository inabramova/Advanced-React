const { forwardTo } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, makeNiceEmail } = require('../mail');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: { ...args },
      },
      info
    );
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    // remove ID from the updates, ID can't be updated
    delete updates.id;
    const item = await ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id },
      },
      info
    );
    return item;
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{id title}`);
    return await ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there's a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`no such user found for email ${email}`);
    // check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password');
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'goodbye' };
  },
  async requestReset(parent, args, ctx, info) {
    // check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error(`no such user found for email ${args.email}`);
    // set a reseet token and expiry
    const promisified = promisify(randomBytes);
    const resetToken = (await promisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // email the token
    const mailRes = await transport.sendMail({
      from: 'inabramova@gmail.com',
      to: user.email,
      subject: 'your password reset token',
      html: makeNiceEmail(`your token is
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reeset</a> `),
    });
    // return message
    return { message: 'thanks' };
  },
  async resetPassword(parent, args, ctx, info) {
    // check if passwords match
    if (args.password !== args.confirmPassword)
      throw new Error("yo passwords don't match");
    // check if it's legit token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('token invalid or expired');
    }
    const password = await bcrypt.hash(args.password, 10);
    // check if it's expired
    // hash their new passwd
    // save new passwd
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return updatedUser;
    // generate JWT
    // set the JWT
    // return the new user
  },
};

module.exports = Mutations;
