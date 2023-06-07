# User management Service Unit Test Cases

## Purpose


This document details the unit test cases for the [User management Service](https://github.com/TaskarCenterAtUW/TDEI-user-management-ts)

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
