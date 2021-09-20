import createAuthHeaders from "./createAuthHeaders";

test("Check to see that ShareASale API headers are properly constructed", () => {
  expect(createAuthHeaders("ABC123", "ZXY456", "void")).toBeTruthy();
});
