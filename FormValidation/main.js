var $ = document.querySelector.bind();
var $$ = document.querySelectorAll.bind();
// đối tượng validation
function Validator(option) {
  function validate(inputElement, rule) {
    // thêm event onblur (bỏ chuột ra ngoài vùng đã trọn) vào selector
    // nếu có lỗi trả về string / không có lỗi => undefined
    let errorMess = rule.test(inputElement.value); // truyền tham số vào function test
    let MessElement = inputElement.parentElement.querySelector(option.errorSelector); // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess
    if (errorMess) {
      // gán mess vào HTML
      MessElement.innerHTML = errorMess;
      inputElement.parentElement.classList.add("invalid"); // add css
    } else {
      MessElement.innerHTML = "";
      inputElement.parentElement.classList.remove("invalid"); // remove css
    }
  }

  // lấy element của form cần vali
  let formElement = document.querySelector(option.from);

  if (formElement) {
    option.rules.forEach((rule) => {
      let inputElement = formElement.querySelector(rule.selector); //rule.selector id của form được truyền vào

      // xử lý sự kiện blur ra khỏi input
      if (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
      }

      // xử lý trường hợp blur vào input
      inputElement.oninput = function () {
        inputElement.parentElement.querySelector(option.errorSelector).innerHTML =
          ""; // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess

        inputElement.parentElement.classList.remove("invalid"); // remove css
      };
    });
  }
}
/**
 * nguyên tác rule:
 * 1.Khi có lỗi => trả ra mess lỗi
 * 2. khi hợp lệ => trả ra undefined
 */
// xử lý form
Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.trim() ? undefined : "Mục này là bắt buộc nhập";
    },
  };
};

// xử lý form email
Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      return regex.test(value) ? undefined : "vui lòng nhập đúng email"; // test ở đây là method
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.length >= min ? undefined : "vui lòng nhập tối thiểu 6 kí tự";
    },
  };
};



Validator({
  from: "#form-1", // id form
  errorSelector: '.form-message',
  rules: [Validator.isRequired("#fullname"), Validator.isEmail("#email"),Validator.minLength('#password',6)], // truyền funtion vào Validator.rules
});
