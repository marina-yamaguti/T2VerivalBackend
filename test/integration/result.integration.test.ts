// it('should process test results and return correct analysis', async () => {
//     const mockAnswers = {
//       answer_values: [
//         { question_number: 1, question_value: 5 },
//         { question_number: 2, question_value: 3 },
//       ],
//     };
  
//     const response = await request(app.getHttpServer())
//       .post('/test-results')
//       .send(mockAnswers)
//       .set('Authorization', `Bearer ${mockToken}`)
//       .expect(201);
  
//     expect(response.body).toEqual({
//       scores: {
//         Logical: 5,
//         Creative: 3,
//       },
//       result: {
//         maxIntellTypeName: 'Logical',
//         maxIntellTypeDescription: 'Logical reasoning',
//         maxIntellTypeCourses: expect.arrayContaining([
//           {
//             name: expect.any(String),
//             description: expect.any(String),
//           },
//         ]),
//         maxScore: 5,
//       },
//     });
//   });