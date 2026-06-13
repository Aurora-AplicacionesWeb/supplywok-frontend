import { User } from '../../domain/model/user.entity.js';

export class UserAssembler {
  static toEntitiesFromResponse(response) {
    const usersArray = Array.isArray(response) ? response : (response.users || []);
    return usersArray.map(resource => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource) {
    return new User({
      id: resource.id,
      email: resource.email,
      password: resource.password,
      phoneNumber: resource.phoneNumber,
      role: resource.role,
      subscription: resource.subscription,
    });
  }
}
