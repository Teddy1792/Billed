/**
 * @jest-environment jsdom
 */
 import 'bootstrap/dist/js/bootstrap';
 import {screen, waitFor} from "@testing-library/dom"
 import userEvent from '@testing-library/user-event';
 import '@testing-library/jest-dom/extend-expect';
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES_PATH } from "../constants/routes.js";
 import { ROUTES } from '../constants/routes';
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import Bills from '../containers/Bills';
 import {extractFileExtension} from "../containers/bills.js"
 import router from "../app/Router.js";
 import  mockedStore  from "../__mocks__/store.js";
 import { formatDate, formatStatus } from "../app/format.js";



 const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
     test("Then bill icon in vertical layout should be highlighted", async () => {
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getByTestId('icon-window'))
       const windowIcon = screen.getByTestId('icon-window')
       expect(windowIcon.classList.contains('active-icon')).toBe(true);
       
     })
     test("Then bills should be ordered from earliest to latest", () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
   })

   describe("extractFileExtension", () => {
    test("should return the file extension", () => {
      const filename = 'example.png';
      const extension = extractFileExtension(filename);
      expect(extension).toBe("png");
    });
  })

  describe("When I click on the icon eye of a bill", () => {
    test("Then a modal should open", () => {
      //charge the UI
      const billsContainer = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      //mock a click function
      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye)
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye(eye))
      userEvent.click(eye)

      expect(handleClickIconEye).toHaveBeenCalled()
      expect(document.body.classList.contains('modal-open')).toBeTruthy()
    })

    test("then the website checks for missing images", () =>{
      const billsContainer = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      //mock a click function
      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye)
      const icon = document.createElement('div');
      icon.setAttribute('data-testid', 'icon-eye');
      icon.setAttribute('data-bill-url', 'http://localhost:5678/null');
      icon.addEventListener('click', () => handleClickIconEye(icon))
      userEvent.click(icon)
      const imageWithSrcAndAlt = screen.getByAltText(/Aucun justificatif uploadé/i, {
        src: 'http://localhost:5678/null',
      });
      expect(imageWithSrcAndAlt).toBeInTheDocument();
      expect(handleClickIconEye).toHaveBeenCalled()
    })

  });

  describe("When I click on the New bill button", () => {
    test("Then I should be redirected to new bill form", () => {
      const billsContainer = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)

      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
 })

describe("When I am on bills page", () => {
  test("then the website fetches the bills from mock API GET", async () => {
    //first we mock the environment
    const bills = new Bills({
      document,
      onNavigate,
      store: mockedStore,
      localStorage: window.localStorage,
    });

    //then we get the bills
    const result = await bills.getBills()
    const mockListResult = await mockedStore.bills().list()

    //expecting result.length (the bills we fetched) to be the length of the mocked list
    expect(result.length).toEqual(mockListResult.length)
    result.forEach((doc, i) => {
      expect(doc.date).toEqual(formatDate(mockListResult[i].date))
    })
  })

  //create another test without a store, in order to check whether or not the test pass with undefined
  test("then getBill function fails when passed an undefined store", async () => {
    //first we mock the environment
    const bills = new Bills({
      document,
      onNavigate,
      store: undefined,
      localStorage: window.localStorage,
    });
    //then we get the bills
    const result = await bills.getBills()
    const mockListResult = await mockedStore.bills().list()
    //expecting result to be undefined
    expect(result).toEqual(undefined)
  })

  test("then the website catches errors", async () => {
    const mockedBills = mockedStore.bills();
  
    // Mock a corrupted document
    const corruptedDoc = {
      // Provide a date value that will cause an error in the formatDate function
      date: "Invalid Date",
      status: "pending"
    };
  
    // Mock the list() function to return the corrupted document
    mockedBills.list = jest.fn().mockResolvedValueOnce([corruptedDoc]);
  
    const bills = new Bills({
      document,
      onNavigate,
      store: mockedStore,
      localStorage: window.localStorage,
    });
  
    // Mock the console.log function to capture the logged error
    console.log = jest.fn()
  
    // Call the getBills function
    const result = await bills.getBills()
  
    // Expect the result to be an array with a length of 1 (the corrupted document)
    expect(result).toHaveLength(1)
  
    // Expect the result to have the same properties as the corrupted document,
    // but with the original unformatted date and formatted status
    expect(result[0]).toEqual({
      ...corruptedDoc,
      date: corruptedDoc.date,
      status: formatStatus(corruptedDoc.status)
    })
  
    // Verify that the error was logged to the console with the correct parameters
    expect(console.log).toHaveBeenCalledWith(expect.any(Error), "for", corruptedDoc);
  })
})








 
 
 