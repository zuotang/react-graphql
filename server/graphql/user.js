import { userModel, postModel } from '../db';
import jwt from 'jsonwebtoken';
import {
  getPageType,
  md5,
  blackList,
  exactLogin,
  getUserFormName,
  getPageData,
} from './public';
import { getThumbnail } from './file';
import APIError from './APIError';
//import findRemoveSync from 'find-remove';
import path from 'path';

export const typeDefs = `
type User{
  id:ID!
  name:String!
  nick_name:String!
  age:Int
  sex:Int
  followersCount:Int
  followingCount:Int
  avatar:String
  roles:[String]
}

${getPageType('User',`keyword:String`)}

input userInput{
  name:String!
  nick_name:String!
  password:String!
  verify_password:String!
  avatar:String
  age:Int
  sex:Int
}
input updateUserInput{
  nick_name:String
  password:String
  avatar:String
  age:Int
  sex:Int
}
extend type Query{
  user(name:String):User
  self:User
  users(keyword:String,first:Int!,after:ID,desc:Boolean):UserPage
}

type Login{
  user:User
  token:String
}

extend type Mutation{
  login(name:String!,password:String!):Login
  join(input:userInput):User
  editUser(input:updateUserInput):User
  delUser(name:String!):Boolean
}
`;
export const getUser = async ({ name }) => {
  let user = await userModel.findOne({ name }).exec();
  return user;
};

export const resolvers = {
  Query: {
    user(_, { name }, ctx) {
      if (name) return getUser({ name });
      exactLogin(ctx.user);
      return ctx.user;
    },
    self(_, {}, ctx) {
      exactLogin(ctx.user);
      return ctx.user;
    },
    async users(_, {keyword,first, after, desc, sort }) {
      let find={};
      if(keyword){
        find={$or:[
          {name:{$regex: keyword}},
          {nick_name:{$regex: keyword}},
          {user_name:{$regex: keyword}}
        ]};
      }
      let page = await getPageData({
        model: userModel,
        find,
        after,
        first,
        desc,
        sort,
        populate: '',
      });
      return {...page,keyword};
    },
  },
  Mutation: {
    async login(_, { name, password }, ctx) {
      password = md5(password); //加密密码
      let user = await userModel.findOne({ name, password }).exec(); //查找用户是否存在
      if (user) {
        var token = jwt.sign({ name: user._doc.name }, 'wysj3910', {
          expiresIn: '7 days',
        });
        ctx.cookies.set('token', token);
        return { token, user };
      } else {
        throw new APIError('账号或密码错误', 1004);
      }
    },
    async join(_, { input }, ctx) {
      input.name = input.name.trim().toLowerCase();
      input.password = input.password.trim();
      input.verify_password = input.verify_password.trim();

      if (input.nick_name.length == 0 || blackList.includes(input.nick_name)) {
        throw new APIError('昵称不合法', 1002);
        return;
      }

      if (
        input.name.length <= 4 ||
        !/^[a-zA-z]\w{3,15}$/.test(input.name) ||
        blackList.includes(input.name)
      ) {
        throw new APIError('用户名不合法', 1003);
        return;
      }

      if (
        input.password.length <= 4 ||
        input.password != input.verify_password
      ) {
        throw new APIError('密码不合法', 1004);
        return;
      }

      let nameRes = await userModel.findOne({ name: input.name });
      if (nameRes) {
        throw new APIError('用户已存在！', 1003);
        return;
      }
      let nickNameRes = await userModel.findOne({ nick_name: input.nick_name });
      if (nickNameRes) {
        throw new APIError('昵称已存在！', 1002);
        return;
      }
      input.avatar = '/default.jpg';
      input.password = md5(input.password); //加密密码
      input.roles = ['default']; //默认用户
      return userModel(input).save();
    },
    async editUser(_, { input }, ctx) {
      exactLogin(ctx.user);
      let id = ctx.user._id;
      let user_name = ctx.user.name;
      if (input.avatar) {
        input.avatar = (await getThumbnail(input.avatar, user_name)).url;
      }
      let res = await userModel.update({ _id: id }, input);
      return getUser({ name: user_name });
    },
    async delUser(_, { name }, ctx) {
      exactLogin(ctx.user);
      let user = await getUserFormName(name);
      await postModel.remove({ user: { $in: user } });
      console.log('删除用户帖子');
      //  console.log(path.resolve(`./files/${name}`))
      //  var result = findRemoveSync(path.resolve(`./files/${name}`), {dir: "*", files: "*.*", ignore:'avatar_*.*'})
      // console.log('删除用户文件')
      return true;
    },
  },
};

//设置用户
export const setUser = async (ctx, next) => {
  let token = ctx.cookies.get('token');
  if (token) {
    try {
      let { name } = jwt.verify(token, 'wysj3910');
      let user = await userModel.findOne({ name }).exec();
      if (user) ctx.user = user;
    } catch (err) {
      console.log('token验证失败');
    }
  }
  await next();
};
