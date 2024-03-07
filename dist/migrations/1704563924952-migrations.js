"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePosts1704563924972 = void 0;
class FakePosts1704563924972 {
    async up(queryRunner) {
        await queryRunner.query(`
    insert into "user" (id, email, username, password, "createdAt", "updatedAt") VALUES (1, 'rabih@gmail.com', 'rabih', '$argon2id$v=19$m=65536,t=3,p=4$OUyTYr6sXnYQyJ4nnhpANw$340jV2eZybwT2ivsjMfeTdSKILeTwySACNZvadZSJ0E','2024-02-18 12:00:05','2024-02-18 12:00:05');

    insert into "user" (id, email, username, password, "createdAt", "updatedAt") VALUES (2, 'rabih1@gmail.com', 'rabih1', '$argon2id$v=19$m=65536,t=3,p=4$OUyTYr6sXnYQyJ4nnhpANw$340jV2eZybwT2ivsjMfeTdSKILeTwySACNZvadZSJ0E', '2024-02-18 12:00:05', '2024-02-18 12:00:05');

    insert into post (title, text, "creatorId", "createdAt") values ('Mixed Blood', 'Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.

    Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.
    
    Curabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla. Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.', 2, '2024-02-18 12:00:03');
    insert into post (title, text, "creatorId", "createdAt") values ('Detroit Rock City', 'Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.
    
    Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.', 1, '2024-02-18 12:00:04');
    insert into post (title, text, "creatorId", "createdAt") values ('War of the Buttons', 'Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.', 1, '2024-02-18 12:00:05');
    insert into post (title, text, "creatorId", "createdAt") values ('Children of Huang Shi, The', 'In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.
    
    Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.
    
    Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.', 1, '2024-02-18 12:00:06');
    insert into post (title, text, "creatorId", "createdAt") values ('ABC Africa', 'Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.
    
    Sed ante. Vivamus tortor. Duis mattis egestas metus.
    
    Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.', 2, '2024-02-18 12:00:07');
    insert into post (title, text, "creatorId", "createdAt") values ('Brother''s War', 'Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.
    
    Sed ante. Vivamus tortor. Duis mattis egestas metus.', 1, '2024-02-18 12:00:08');
    insert into post (title, text, "creatorId", "createdAt") values ('Ringu 2 (Ring 2)', 'Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.
    
    Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.', 1, '2024-02-18 12:00:09');
    insert into post (title, text, "creatorId", "createdAt") values ('Wild One, The', 'Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.
    
    Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.', 1, '2024-02-18 12:00:10');
    insert into post (title, text, "creatorId", "createdAt") values ('Broadway Serenade', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin risus. Praesent lectus.
    
    Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.
    
    Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.', 1, '2024-02-18 12:00:11');
    insert into post (title, text, "creatorId", "createdAt") values ('Necessary Death, A', 'Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.', 1, '2024-02-18 12:00:12');
    insert into post (title, text, "creatorId", "createdAt") values ('One Hour Photo', 'Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum.
    
    In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam
    ', 1, '2024-02-18 12:00:13');

    insert into post (title, text, "creatorId", "createdAt") values ('Fast and the Furious: Tokyo Drift, The (Fast and the Furious 3, The)', 'Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.

    Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.

    Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.', 2, '2024-02-18 12:00:13');
    insert into post (title, text, "creatorId", "createdAt") values ('Night Crossing', 'Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.

    Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.', 1, '2024-02-18 12:00:14');
    insert into post (title, text, "creatorId", "createdAt") values ('Space Odyssey: Voyage to the Planets', 'Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.', 1, '2024-02-18 12:00:15');
    insert into post (title, text, "creatorId", "createdAt") values ('Common Thread, A (a.k.a. Sequins) (Brodeuses)', 'Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.

    In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.

    Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.', 1, '2024-02-18 12:00:16');
    insert into post (title, text, "creatorId", "createdAt") values ('Ishq', 'Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.

    Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.', 2, '2024-02-18 12:00:17');
    insert into post (title, text, "creatorId", "createdAt") values ('Drug War (Du zhan)', 'Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

    Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.', 1, '2024-02-18 12:00:18');
    insert into post (title, text, "creatorId", "createdAt") values ('Vincent Wants to Sea (Vincent will meer)', 'Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.

    Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.

    Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.', 1, '2024-02-18 12:00:19');
    insert into post (title, text, "creatorId", "createdAt") values ('Karla', 'Integer tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat.', 1, '2024-02-18 12:00:20');
    insert into post (title, text, "creatorId", "createdAt") values ('Super', 'Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat.

    In congue. Etiam justo. Etiam pretium iaculis justo.

    In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.', 2, '2024-02-18 12:00:21');
    insert into post (title, text, "creatorId", "createdAt") values ('Mitchell', 'Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.

    Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.', 1, '2024-02-18 12:00:22');
    insert into post (title, text, "creatorId", "createdAt") values ('Criminal Law', 'Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.

    Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.

    Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.', 1, '2024-02-18 12:00:23');
    insert into post (title, text, "creatorId", "createdAt") values ('Autumn', 'Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pell entesque.', 2, '2024-02-18 12:00:24');
    `);
    }
    async down(_) { }
}
exports.FakePosts1704563924972 = FakePosts1704563924972;
