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
 import BillsPage from "../containers/bills.js";
 import { mockedBills } from "../__mocks__/store.js";



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

  //test d'intégration = test une fonctionnalité (donc des comportements dans l'interface, directement dans l'interface, si je click ici ou là)
  //un test unitaire va tester une seule fonction (avec x ou y paramètre)
  //un test unitaire sur bills : il faut instancier bills avec store ou sans store par exemple

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

 // test d'intégration getBills
describe("When I am on bills page", () => {
  test("then the website fetches the bills from mock API GET", async () => {
    document.body.innerHTML = new BillsPage({ data: bills });
    const mockStore = {
      bills: () => ({
        list: jest.fn().mockResolvedValue({ data: mockedBills }),
      }),
    };

    const result = await getBills.call({ store: mockStore }); // Call getBills directly

    // Assertions
    expect(mockStore.bills().list).toHaveBeenCalled();
    expect(result).toEqual(mockedBills);
  });
});

describe("When I am on bills page", () => {
  test("then the website fetches the bills from mock API GET", async () => {
    // Arrange
    const mockOnNavigate = ROUTES;
    const mockGetBills = jest.fn().mockResolvedValue(bills);
    const mockDocument = mockGetBills;

    // Instantiate the default class with required dependencies
    const billsPage = BillsPage({
      document: document.body.innerHTML = new BillsPage({ data: bills }),
      onNavigate: mockOnNavigate,
      getBills: jest.fn().mockResolvedValue(bills),
    });

    // Act
    const result = await billsPage.getBills();

    // Assert
    expect(mockGetBills).toHaveBeenCalled();
    expect(result).toEqual(/* expected bills */);
  });
});






 
 
 