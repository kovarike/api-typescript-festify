interface CreateAccount{
	id: string,
	email: string,
	name: string,
	password: string,
	username: string,
}


export class DataBase{




	creat(user: CreateAccount){
		const { id, email, name, username, password } = user;

		const pushDatabase = [{
			id,
			name,
			username, 
			password,
			email
		}];

		return pushDatabase;
	}

}