const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// đối tượng validation
function Validator(option) {
  var selectorRules = {};

  function validate(inputElement, rule) {
    // thêm event onblur (bỏ chuột ra ngoài vùng đã trọn) vào selector
    // nếu có lỗi trả về string / không có lỗi => undefined
    let errorMess; //= rule.test(inputElement.value); // truyền tham số vào function test
    let MessElement = inputElement.parentElement.querySelector(
      option.errorSelector
    ); // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess

    let rules = selectorRules[rule.selector];

    // lặp qua từng rule và kiểm tra
    // nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      errorMess = rules[i](inputElement.value);
      if (errorMess) break;
    }

    if (errorMess) {
      // gán mess vào HTML
      MessElement.innerHTML = errorMess;
      inputElement.parentElement.classList.add("invalid"); // add css
    } else {
      MessElement.innerHTML = "";
      inputElement.parentElement.classList.remove("invalid"); // remove css
    }

    return !errorMess; // có lỗi sẽ trả về flase
  }

  // lấy element của form cần vali
  let formElement = document.querySelector(option.from);

  if (formElement) {
    // hủy sự kiện submit
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true; // true = khong cos loi

      option.rules.forEach((rule) => {
        // lặp qua từng phần tử và kiểm tra
        let inputElement = formElement.querySelector(rule.selector); //rule.selector id của form được truyền vào
        let isValid = validate(inputElement, rule); // function kiểm tra nếu có lỗi trả về false

        if (!isValid) {
          // neu có lỗi sẽ app thành true và ép isFormValid = false
          isFormValid = false;
        }
      });

      // nếu option có submit function

      if (isFormValid) {
        if (typeof option.onsubmit === "function") {
          let enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          // lấy value từ form đã nhập
          let formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            return (values[input.name] = input.value) && values;
          },
          {});

          option.onsubmit(formValues);
        }
      } else {
      }
    };

    option.rules.forEach((rule) => {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        //lưu lại các rules cho mỗi input
        selectorRules[rule.selector] = [rule.test];
      }

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
Validator.isRequired = function (selector, mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.trim() ? undefined : mess || "Mục này là bắt buộc nhập";
    },
  };
};

// xử lý form email
Validator.isEmail = function (selector, mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      return regex.test(value) ? undefined : mess || "vui lòng nhập đúng email"; // test ở đây là method
    },
  };
};

Validator.minLength = function (selector, min, mess) {
  return {
    selector: selector,
    test: function (value) {
      // hàm kiểm tra đã nhập input đúng chưa
      return value.length >= min
        ? undefined
        : mess || "vui lòng nhập tối thiểu 6 kí tự";
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
    Validator.isRequired("#fullname", "Vui lòng nhập tênF"),
    Validator.isEmail("#email", "vui lòng nhập đúng mailF"),
    Validator.minLength(
      "#password",
      6,
      "vui lòng nhập mật khẩu dài hơn 6 kí tựF"
    ),
    Validator.isConfirmed(
      "#password_confirmation",
      function () {
        return $("#password").value;
      },
      "Mật khẩu nhập lại không chính xácF"
    ),
  ], // truyền funtion vào Validator.rules

  onsubmit: function (data) {
    console.log(data);
  },
});
