const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// đối tượng validation
function Validator(option) {
  function validate(inputElement, rule) {
    // thêm event onblur (bỏ chuột ra ngoài vùng đã trọn) vào selector
    // nếu có lỗi trả về string / không có lỗi => undefined
    let errorMess = rule.test(inputElement.value); // truyền tham số vào function test
    let MessElement = inputElement.parentElement.querySelector(
      option.errorSelector
    ); // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess
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
        inputElement.parentElement.querySelector(
          option.errorSelector
        ).innerHTML = ""; // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess

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
Validator.isRequired = function (selector,mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.trim() ? undefined : mess ||"Mục này là bắt buộc nhập";
    },
  };
};

// xử lý form email
Validator.isEmail = function (selector,mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      return regex.test(value) ? undefined : mess ||"vui lòng nhập đúng email"; // test ở đây là method
    },
  };
};

Validator.minLength = function (selector, min,mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.length >= min
        ? undefined
        : mess ||"vui lòng nhập tối thiểu 6 kí tự";
    },
  };
};

Validator.isConfirmed = function (selector, getCofirmValue, mess) {
  return {
    selector: selector,
    test: function (value) {
      return value === getCofirmValue()
        ? undefined
        : mess || "gia trị nhập vào không chính xác";
    },
  };
};

Validator({
  from: "#form-1", // id form
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#fullname",'Vui lòng nhập tên'),
    Validator.isEmail("#email",'vui lòng nhập đúng mail'),
    Validator.minLength("#password", 6,'vui lòng nhập mật khẩu dài hơn 6 kí tự'),
    Validator.isConfirmed("#password_confirmation", function () {
      return $("#password").value;
    }, 'Mật khẩu nhập lại không chính xác'),
  ], // truyền funtion vào Validator.rules
});
