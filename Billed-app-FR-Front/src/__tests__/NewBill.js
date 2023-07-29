/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen } from '@testing-library/dom';
 import { waitFor } from '@testing-library/dom'
 import userEvent from '@testing-library/user-event';
 import { localStorageMock } from '../__mocks__/localStorage';
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { ROUTES } from '../constants/routes';
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
 
 let newBillContainer
 let mockUpdateBill

 beforeEach(() => {
   document.body.innerHTML = NewBillUI()
   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
   window.localStorage.setItem('user', JSON.stringify({
     type: 'Employee',
     email: 'a@a', // Set the correct email here
   }))
 
   newBillContainer = new NewBill({
     document,
     onNavigate,
     store: mockedStore, //initialiser avec un store
     localStorage: window.localStorage,
   });

   mockUpdateBill = jest.fn()
   newBillContainer.updateBill = mockUpdateBill;
 })

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the user should see the newBill form", () => {
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })

    test("Then the user can upload a file with the right type", async () => {
      const fileInput = screen.getByTestId('file');
      const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })
      const alert = jest.fn((param) => {console.log(param)})
      // Mock the alert function
      window.alert = alert
    
      await waitFor(() =>
      fireEvent.change(fileInput, {
        target: { files: [file] },
      })
      );
    
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(alert).not.toHaveBeenCalled()
    });    

    test("Then the user can't upload the wrong type of file", async () => {
      const fileInput = screen.getByTestId('file')
      const file = new File(["(⌐□_□)"], "chucknorris.pdf", { type: "pdf" })
      const alert = jest.fn((param) => {console.log(param)})
      const btnValidation = document.getElementById('btn-send-bill')
      // Mock the alert function
      window.alert = alert
    
      await waitFor(() =>
      fireEvent.change(fileInput, {
        target: { files: [file] },
      })
      );
    
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(alert).toHaveBeenCalled()
      expect(btnValidation.disabled).toBe(true)
    });   
    
    
  })

  describe("When I submit new bill form", () => {
    test("it works if all fields are filled properly", () => {
    // Mock form input values
    const expenseTypeSelect = screen.getByTestId('expense-type')
    const expenseNameInput = screen.getByTestId('expense-name')
    const amountInput = screen.getByTestId('amount')
    const datepickerInput = screen.getByTestId('datepicker')
    const vatInput = screen.getByTestId('vat')
    const pctInput = screen.getByTestId('pct')
    const commentaryInput = screen.getByTestId('commentary')

    // Set form input values
    userEvent.selectOptions(expenseTypeSelect, ['Transports'])
    userEvent.type(expenseNameInput, 'Some expense name')
    userEvent.type(amountInput, '200')
    userEvent.type(datepickerInput, '2002-02-02')
    userEvent.type(vatInput, '40')
    userEvent.type(pctInput, '20')
    userEvent.type(commentaryInput, 'Some commentary')

    // Mock form submission
    const handleSubmitFn = jest.fn(newBillContainer.handleSubmit)
    const SubmitFormButton = screen.getByTestId('form-new-bill')
    SubmitFormButton.addEventListener('click', handleSubmitFn)
    const userStored = window.localStorage.getItem('user')
    const user = JSON.parse(userStored)
    userEvent.click(SubmitFormButton)

  // Expectations
  expect(handleSubmitFn).toHaveBeenCalled()
  expect(newBillContainer.updateBill).toHaveBeenCalled()
  expect(newBillContainer.updateBill).toHaveBeenCalledWith(expect.objectContaining({
    email: JSON.parse(localStorage.getItem("user")).email,
    type: 'Transports',
    name: 'Some expense name',
    amount: 200,
    date: '2002-02-02',
    vat: '40',
    pct: 20,
    commentary: 'Some commentary',
    fileUrl: null,
    fileName: null,
    status: 'pending',
      }));
    })
  })

  test("Then I should be redirected to Bills page", () => {
    const handleSubmitFn = jest.fn(newBillContainer.handleSubmit)
    const SubmitFormButton = screen.getByTestId('form-new-bill')
    SubmitFormButton.addEventListener('click', handleSubmitFn)
    userEvent.click(SubmitFormButton)
    expect(handleSubmitFn).toHaveBeenCalled()
    expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
  })
})