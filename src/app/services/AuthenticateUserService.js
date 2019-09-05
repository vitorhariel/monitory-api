import User from '../models/User';
import Playerid from '../models/Playerid';
import Course from '../models/Course';
import { StudentSuapApi } from '../../services/api';

class AuthenticateUserService {
  async run({ token, playerid }) {
    const response = await StudentSuapApi.get(
      '/minhas-informacoes/meus-dados/',
      {
        headers: { Authorization: `JWT ${token}` },
      }
    );

    const {
      id,
      matricula,
      nome_usual,
      tipo_vinculo,
      cpf,
      data_nascimento: data_de_nascimento,
      email: email_suap,
      url_foto_150x200: avatar_suap,
    } = response.data;

    const {
      nome: nome_completo,
      curso,
      campus,
      situacao,
      curriculo_lattes,
    } = response.data.vinculo;

    const userExists = await User.findByPk(id);

    if (userExists) {
      if (playerid) {
        const userPlayerids = await Playerid.findOne({
          where: {
            id: playerid,
          },
        });

        if (!userPlayerids) {
          const course = await Course.findOne({
            where: {
              description: userExists.curso,
            },
          });

          const course_id = course.id;

          await Playerid.create({
            id: playerid,
            user_id: userExists.id,
            course_id,
            year: userExists.curso_ano,
            turn: userExists.curso_turno,
            campus: userExists.campus,
          });
        }
      }

      return userExists;
    }

    const newUser = await User.create({
      id,
      matricula,
      nome_usual,
      tipo_vinculo,
      cpf,
      data_de_nascimento,
      email_suap,
      avatar_suap,
      nome_completo,
      curso,
      campus,
      situacao,
      curriculo_lattes,
    });

    if (playerid) {
      const course = await Course.findOne({
        where: {
          description: newUser.curso,
        },
      });

      const course_id = course.id;

      await Playerid.create({
        id: playerid,
        user_id: newUser.id,
        course_id,
        year: newUser.curso_ano,
        turn: newUser.curso_turno,
        campus: newUser.campus,
      });
    }

    return newUser;
  }
}

export default new AuthenticateUserService();
