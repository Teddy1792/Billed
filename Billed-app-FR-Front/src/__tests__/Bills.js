/**
 * @jest-environment jsdom
 */

 import {screen, waitFor} from "@testing-library/dom"
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES_PATH } from "../constants/routes.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import { Bills } from "../containers/Bills.js";
 import userEvent from '@testing-library/user-event';
 import '@testing-library/jest-dom/extend-expect';
 import {extractFileExtension} from "../containers/bills.js"
 
 import router from "../app/Router.js";
import { modal } from "../views/DashboardFormUI.js";
 
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
       //to-do write expect expression
            /* expect(windowIcon).toHaveClass("active-icon");
            gets me 
            TypeError: expect(...).toHaveClass is not a function */
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

   describe('extractFileExtension', () => {
    test('should return the file extension', () => {
      const filename = 'example.png';
      const extension = extractFileExtension(filename);
      expect(extension).toBe('png');
    });
  })

   describe("When I click on the icon eye of a bill", () => {
    test("Then a modal should open", () => {
      const handleClickIconEye = jest.fn();
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye);
      
      // Action
      userEvent.click(eye);
      
      // Assertion
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(document.body.querySelector('.modal-content')).not.toBeNull();
    })
  })


  describe("When I click on the icon eye of a bill", () => {
    test("Then a modal should open", () => {
      const handleClickIconEye = jest.fn();
      const eye = screen.getAllByTestId('icon-eye')[0];
      eye.addEventListener('click', handleClickIconEye);
  
      // Action
      userEvent.click(eye);
  
      // Assertion
      expect(handleClickIconEye).toHaveBeenCalled();
  
      // Verify the modal is open
      expect(document.body.querySelector('img')).toBeInTheDocument();
    });
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
  });

    
 })