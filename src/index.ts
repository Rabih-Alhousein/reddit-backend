import { MikroORM, RequiredEntityData } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import microOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(microOrmConfig);
  await orm.getMigrator().up();

  // const post = orm.em.create(Post, {
  //   title: "my first post",
  // } as RequiredEntityData<Post>);
  // await orm.em.persistAndFlush(post);
};

main();
