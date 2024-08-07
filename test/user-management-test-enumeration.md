# User Management Service Unit Test Cases

## Purpose


This document details the unit test cases for the [User Management Service](https://github.com/TaskarCenterAtUW/TDEI-user-management-ts)

------------

## Test Framework

Unit test cases are to be written using [Jest](https://jestjs.io/ "Jest")

------------
## Test Cases


### Test cases table definitions 
- **Component** -> Specifies the code component 
- **Feature Under Test** -> Target method name
- **Test Target** -> Specific requirement to test. ex. Functional, security etc.
- **Scenario** -> Requirement to test
- **Expectation** -> Expected result from executed scenario

### Jest code pattern

```javascript
describe("{{Component}}", () => {
	describe("{{Feature Under Test}}", () => {
		describe("{{Test Target}}", () => {  
			const getTestData => return {};
			it('{{Scenario}}, {{Expectation}}', () => {
				//Arrange
				let testData = getTestData();
				let controller = new controller();
				//Act
				const result = controller.getVersions();
				//Assert
				expect(result.status).toBe(200);
				expect(result.myAwesomeField).toBe('valid');
			});
 		});
 	});
 });
```


### Test cases

| Component | Feature Under Test | Test Target | Scenario | Expectation | Status |
|--|--|--|--|--|--|
| Flex Controller | Create Service | Functional| When requested | Expect to return new service_id |:white_check_mark:|
| Flex Controller | Create Service | Functional| When database foreignkey constraint exception occurs | Expect to return HTTP status 400 |:white_check_mark:|
| Flex Controller | Create Service | Functional| When database uniquekey constraint (same service_name + project_group_id) exception occurs | Expect to return HTTP status 400 |:white_check_mark:|
| Flex Controller | Create Service | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Flex Controller | Update Service | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Flex Controller | Update Service | Functional| When database uniquekey constraint (same service_name + project_group_id) exception occurs| Expect to return HTTP status 400 |:white_check_mark:|
| Flex Controller | Update Service | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Flex Controller | Update Service | Functional| When service_id not provided| Expect to return HTTP status 400 |:white_check_mark:|
| Flex Controller | Get Flex Service | Functional| When requested without any filter| Expect to return flex service list |:white_check_mark:|
| Flex Controller | Get Flex Service | Functional| When requested with all filters| Expect to return flex service list |:white_check_mark:|
| Flex Controller | Get Flex Service | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Flex Controller | Update Service Status | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Flex Controller | Update Service Status | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
|--|--|--|--|--|--|
| Pathways Controller | Create Station | Functional| When requested | Expect to return new station_id |:white_check_mark:|
| Pathways Controller | Create Station | Functional| When database foreignkey constraint exception occurs | Expect to return HTTP status 400 |:white_check_mark:|
| Pathways Controller | Create Station | Functional| When database uniquekey constraint (same station_name + project_group_id) exception occurs | Expect to return HTTP status 400 |:white_check_mark:|
| Pathways Controller | Create Station | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Pathways Controller | Update Station | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Pathways Controller | Update Station | Functional| When database uniquekey constraint (same station_name + project_group_id) exception occurs| Expect to return HTTP status 400 |:white_check_mark:|
| Pathways Controller | Update Station | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Pathways Controller | Update Station | Functional| When station_id not provided| Expect to return HTTP status 400 |:white_check_mark:|
| Pathways Controller | Get Pathways Station | Functional| When requested without any filter| Expect to return pathways station list |:white_check_mark:|
| Pathways Controller | Get Pathways Station | Functional| When requested with all filters| Expect to return pathways station list |:white_check_mark:|
| Pathways Controller | Get Pathways Station | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Pathways Controller | Update Station Status | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Pathways Controller | Update Station Status | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
|--|--|--|--|--|--|
| Project Group Controller | Create Project Group | Functional| When requested| Expect to return new projectGroups id |:white_check_mark:|
| Project Group Controller | Create Project Group | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Project Group Controller | Create Project Group | Functional| When database uniquekey constraint (same project_group_name ) exception occurs| Expect to return HTTP status 400 |:white_check_mark:|
| Project Group Controller | Update Project Group | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Project Group Controller | Update Project Group | Functional|When database uniquekey constraint (same project_group_name + project_group_id) exception occurs| Expect to return HTTP status 400 |:white_check_mark:|
| Project Group Controller | Update Project Group | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Project Group Controller | Get Project Group | Functional| When requested without any filter| Expect to return project group list |:white_check_mark:|
| Project Group Controller | Get Project Group | Functional| When requested with all filters| Expect to return projectGroups list |:white_check_mark:|
| Project Group Controller | Get Project Group | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Project Group Controller | Update Project Group Status | Functional| When requested| Expect to return boolean true on success |:white_check_mark:|
| Project Group Controller | Update Project Group Status | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| Project Group Controller | Get Project Group Users | Functional| When requested| Expect to return projectGroups users list |:white_check_mark:|
| Project Group Controller | Get Project Group Users | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
|--|--|--|--|--|--|
| User Controller | Get Roles | Functional| When requested| Expect to return Role list |:white_check_mark:|
| User Controller | Get Roles | Functional| When database exception occurs| Expect to return HTTP status 500 |:white_check_mark:|
| User Controller | Login | Functional| When login with valid credentials| Expect to return Token response |:white_check_mark:|
| User Controller | Login | Functional| When invalid credentials provided| Expect to return HTTP status 500 |:white_check_mark:|
| User Controller | Refresh Token | Functional| When valid refresh token provided| Expect to return refreshed token response |:white_check_mark:|
| User Controller | Refresh Token | Functional| When invalid refresh token provided| Expect to return HTTP status 500 |:white_check_mark:|
| User Controller | Refresh Token | Functional| When no refresh token provided| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Register User | Functional| When registered with required input| Expect to return user profile response |:white_check_mark:|
| User Controller | Register User | Functional| When wrong credentials provided| Expect to return HTTP status 500 |:white_check_mark:|
| User Controller | Update User Permissions | Functional| When provided invalid username| Expect to return HTTP status 404 |:white_check_mark:|
| User Controller | Update User Permissions | Functional| When managing self permission| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Update User Permissions | Functional| When managing restricted admin role| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Update User Permissions | Functional| When database constraint error| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Update User Permissions | Functional| When updating valid permission details| Expect to return success message |:white_check_mark:|
| User Controller | Revoke User Permissions | Functional| When provided invalid username| Expect to return HTTP status 404 |:white_check_mark:|
| User Controller | Revoke User Permissions | Functional| When managing self permission| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Revoke User Permissions | Functional| When managing restricted admin role| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Revoke User Permissions | Functional| When database constraint error| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Revoke User Permissions | Functional| When updating valid permission details| Expect to return success message |:white_check_mark:|
| User Controller | User Profile | Functional| When provided username| Expect to return user profile details |:white_check_mark:|
| User Controller | User Profile | Functional| When not provided user_name| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | User Profile | Functional| When user not found| Expect to return HTTP status 404 |:white_check_mark:|
| User Controller | Project Group Roles| Functional| When requested| Expect to return projectGroups role details |:white_check_mark:|
| User Controller | Project Group Roles| Functional| When requested projectGroups roles for different user| Expect to return HTTP status 403 |:white_check_mark:|
| User Controller | Project Group Roles| Functional| When user not provided| Expect to return HTTP status 400 |:white_check_mark:|
| User Controller | Project Group Roles| Functional| When database error| Expect to return HTTP status 500 |:white_check_mark:|
|--|--|--|--|--|--|
| Flex Service | Create Service| Functional| When requested| Expect to return new service_id |:white_check_mark:|
| Flex Service | Create Service| Functional| When unique key exception thrown| Expect to return DuplicateException |:white_check_mark:|
| Flex Service | Create Service| Functional| When foreign key exception thrown| Expect to return ForeignKeyException |:white_check_mark:|
| Flex Service | Create Service| Functional| When database exception thrown| Expect to throw error |:white_check_mark:|
| Flex Service | Update Service| Functional| When requested| Expect to return success |:white_check_mark:|
| Flex Service | Update Service| Functional| When unique key exception thrown| Expect to return DuplicateException |:white_check_mark:|
| Flex Service | Update Service| Functional| When database exception thrown| Expect to throw error |:white_check_mark:|
| Flex Service | Get Flex Service| Functional| When requested| Expect to return list of services |:white_check_mark:|
| Flex Service | Get Flex Service| Functional| When database exception occured| Expect to throw error |:white_check_mark:|
| Flex Service | Update Service Status| Functional| When requested| Expect to return success |:white_check_mark:|
| Flex Service | Update Service Status| Functional| When database error occured| Expect to throw error |:white_check_mark:|
|--|--|--|--|--|--|
| Pathways Station Service | Create Station| Functional| When requested| Expect to return new station_id |:white_check_mark:|
| Pathways Station Service | Create Station| Functional| When unique key exception thrown| Expect to return DuplicateException |:white_check_mark:|
| Pathways Station Service | Create Station| Functional| When foreign key exception thrown| Expect to return ForeignKeyException |:white_check_mark:|
| Pathways Station Service | Create Station| Functional| When database exception thrown| Expect to throw error |:white_check_mark:|
| Pathways Station Service | Update Station| Functional| When requested| Expect to return success |:white_check_mark:|
| Pathways Station Service | Update Station| Functional| When unique key exception thrown| Expect to return DuplicateException |:white_check_mark:|
| Pathways Station Service | Update Station| Functional| When database exception thrown| Expect to throw error |:white_check_mark:|
| Pathways Station Service | Get Pathways Station| Functional| When requested| Expect to return list of stations |:white_check_mark:|
| Pathways Station Service | Get Pathways Station| Functional| When database exception occured| Expect to throw error |:white_check_mark:|
| Pathways Station Service | Update Station Status| Functional| When requested| Expect to return success |:white_check_mark:|
| Pathways Station Service | Update Station Status| Functional| When database error occured| Expect to throw error |:white_check_mark:|
|--|--|--|--|--|--|
| Project Groups Service | Create Project Group | Functional| When requested| Expect to return new project_group_id |:white_check_mark:|
| Project Groups Service | Create Project Group | Functional| When unique key exception occurs| Expect to throw DuplicateException |:white_check_mark:|
| Project Groups Service | Create Project Group | Functional| When database exception occurs| Expect to throw error |:white_check_mark:|
| Project Groups Service | Update Project Group | Functional| When requested| Expect to return true on success |:white_check_mark:|
| Project Groups Service | Update Project Group | Functional| When unique key exception occurs| Expect to throw DuplicateException |:white_check_mark:|
| Project Groups Service | Update Project Group | Functional| When database exception occurs| Expect to throw error |:white_check_mark:|
| Project Groups Service | Get Project Group | Functional| When requested| Expect to return list of project group |:white_check_mark:|
| Project Groups Service | Get Project Group | Functional| When database exception occured| Expect to throw error |:white_check_mark:|
| Project Groups Service | Get Project Group Users | Functional| When requested| Expect to return list of project groups users |:white_check_mark:|
| Project Groups Service | Get Project Group Users | Functional| When database error occured| Expect to throw error |:white_check_mark:|
| Project Groups Service | Update Project Group Status | Functional| When requested| Expect to return success |:white_check_mark:|
| Project Groups Service | Update Project Group Status | Functional| When database error occured| Expect to throw error |:white_check_mark:|
|--|--|--|--|--|--|
| User Management Service | Refresh Token | Functional| When requested| Expect to return refreshed access token |:white_check_mark:|
| User Management Service | Refresh Token | Functional| When error refreshing token| Expect to throw error |:white_check_mark:|
| User Management Service | Login | Functional| When requested| Expect to return access token |:white_check_mark:|
| User Management Service | Login | Functional| When error authenticating| Expect to throw error |:white_check_mark:|
| User Management Service | Register User | Functional| When requested| Expect to return user profile response on success |:white_check_mark:|
| User Management Service | Register User | Functional| When user already exists with same email| Expect to throw error |:white_check_mark:|
| User Management Service | Register User | Functional| When error registering| Expect to throw error |:white_check_mark:|
| User Management Service | User Profile | Functional| When requested| Expect to return user profile response on success |:white_check_mark:|
| User Management Service | User Profile | Functional| When user profile not found| Expect to throw UserNotFoundException |:white_check_mark:|
| User Management Service | Get Roles | Functional| When requested| Expect to return list of roles |:white_check_mark:|
| User Management Service | Get Roles | Functional| When database error occured| Expect to throw Error |:white_check_mark:|
| User Management Service | Update Permission | Functional| When requested as Admin| Expect to return true on success |:white_check_mark:|
| User Management Service | Update Permission | Functional| When requested as POC| Expect to return true on success |:white_check_mark:|
| User Management Service | Update Permission | Functional| When requested as POC with admin restricted permissions| Expect to throw HttpException |:white_check_mark:|
| User Management Service | Update Permission | Functional| When managing own permissions| Expect to return HttpException |:white_check_mark:|
| User Management Service | Update Permission | Functional| When foreign key exception occured| Expect to throw ForeignKeyDbException |:white_check_mark:|
| User Management Service | Update Permission | Functional| When database exception occured| Expect to throw Error |:white_check_mark:|
| User Management Service | Revoke Permission | Functional| When requested as Admin| Expect to return true on success |:white_check_mark:|
| User Management Service | Revoke Permission | Functional| When requested as POC| Expect to return true on success |:white_check_mark:|
| User Management Service | Revoke Permission | Functional| When requested as POC with admin restricted permissions| Expect to throw HttpException |:white_check_mark:|
| User Management Service | Revoke Permission | Functional| When managing own permissions| Expect to return HttpException |:white_check_mark:|
| User Management Service | Revoke Permission | Functional| When removing user from project groups| Expect to return true on success |:white_check_mark:|
| User Management Service | Remove User from Project groups | Functional| When requested| Expect to return success |:white_check_mark:|
| User Management Service | Remove User from Project groups | Functional| When database error occured| Expect to throw error |:white_check_mark:|
| User Management Service | Remove User Roles from Project groups | Functional| When requested| Expect to return success |:white_check_mark:|
| User Management Service | Get Role Details by Name | Functional| When requested| Expect to return map of role_id and name |:white_check_mark:|
| User Management Service | Get Role Details by Name | Functional| When database error occured| Expect to throw error |:white_check_mark:|
| User Management Service | Get User Roles | Functional| When requested| Expect to return list of user roles |:white_check_mark:|
| User Management Service | Get User Roles | Functional| When database error occured| Expect to throw error |:white_check_mark:|
| User Management Service | Get User Project groups with Roles | Functional| When requested| Expect to return list of user project groups with roles |:white_check_mark:|
| User Management Service | Get User Project groups with Roles | Functional| When database error occured| Expect to throw error |:white_check_mark:|


### Integration Test cases

| Component | Feature Under Test | Scenario | Expectation | Status |
|--|--|--|--|--|
| User Management Service | Auth Service | Verifying auth service generate secret api integration | Expect to return HTTP status 200 |:white_check_mark:|
| User Management Service | Permission Request | Verifying auth permission with invalid credentials| Expect to resolve as false (and not throw exception) |:white_check_mark:|
