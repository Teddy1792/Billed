/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen } from '@testing-library/dom';
 import userEvent from '@testing-library/user-event';
 import { localStorageMock } from '../__mocks__/localStorage';
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { ROUTES } from '../constants/routes';
 import BillsUI from '../views/BillsUI';
 import  mockedStore  from "../__mocks__/store.js";
 
 const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname })
 }
 
 const newBill = {
   'id': 'qcCK3SzECmaZAGRrHja7',
   'status': 'pending',
   'pct': 20,
   'amount': 200,
   'email': 'a@a',
   'name': 'testPOST',
   'vat': '40',
   'fileName': 'preview-facture-free-201801-pdf-1.jpg',
   'date': '2002-02-02',
   'commentAdmin': '',
   'commentary': 'test2',
   'type': 'Restaurants et bars',
   'fileUrl': 'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732'
 }
 
 let newBillContainer;

 beforeEach(() => {
   document.body.innerHTML = NewBillUI()
   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
   window.localStorage.setItem('user', JSON.stringify({
     type: 'Employee'
   }))
 
   newBillContainer = new NewBill({
     document,
     onNavigate,
     store: null,
     localStorage: window.localStorage,
   });
 })

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the user should see the newBill form", () => {
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })

    test("Then the user can upload a file", async () => {
      //const handleChangeFile = jest.fn(newBillContainer.handleChangeFile)
      const handleChangeFile = jest.spyOn(newBillContainer, 'handleChangeFile');
      console.log('newBillContainer',newBillContainer);
      const fileInput = screen.getByTestId('file');
      const file = new File(['file content'], 'file.png', { type: 'image/png' });
    
      // Mock the alert function
      window.alert = jest.fn();
    
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
    
      fireEvent.change(fileInput);
    
      expect(screen.getByTestId('file')).toBeTruthy();
      expect(handleChangeFile).toHaveBeenCalled();
    
      expect(newBillContainer.fileUrl).toBe('https://url.test');
      expect(newBillContainer.fileName).toBe('file.png');
    
      handleChangeFile.mockRestore();
    });    
    
    
  })
  describe("When I submit new bill form", () => {
    test("Then I should be redirected to Bills page", () => {
      const handleSubmitFn = jest.fn(newBillContainer.handleSubmit);
      const SubmitFormButton = screen.getByTestId('form-new-bill');
      SubmitFormButton.addEventListener('click', handleSubmitFn);
      userEvent.click(SubmitFormButton);
      expect(handleSubmitFn).toHaveBeenCalled();
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    })
  })
})