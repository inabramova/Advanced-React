const {forwardTo} = require('prisma-binding');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
    async createItem(parent, args, ctx, info){
        //TODO: check if they are logged in
        const item= await ctx.db.mutation.createItem({
            data:{ ...args }
        },info);
        console.log(item);
        return item;
    },

    async updateItem(parent, args, ctx, info){
        const updates = {...args};
        delete updates.id;
        const item = await ctx.db.mutation.updateItem({ 
            data:updates,
            where:{id: args.id}
        },info);
        return item;
    },

    async deleteItem(parent, args, ctx, info){
        const where = {id: args.id};
        const item = await ctx.db.query.item({where},`{id title}`);
        return await ctx.db.mutation.deleteItem({where}, info);
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
};

module.exports = Mutations;
