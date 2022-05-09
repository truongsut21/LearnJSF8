const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// đối tượng validation
function Validator(option) {
  function getErorrElement(inputElement, selector) {
    const elementParent = inputElement.closest(option.formGroupSelector); // lấy thẻ chả from group
    const errorElement = elementParent.querySelector(option.errorSelector); // từ element cha lấy con
    return errorElement;
  }

  var selectorRules = {}; // mảng chứa các function test của các các selector input

  function validate(inputElement, rule) {
    // thêm event onblur (bỏ chuột ra ngoài vùng đã trọn) vào selector
    // nếu có lỗi trả về string / không có lỗi => undefined
    let errorMess; //= rule.test(inputElement.value); // truyền tham số vào function test
    let MessElement = getErorrElement(inputElement); // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess

    // trường hợp có nhiều test trong 1 selector
    let rules = selectorRules[rule.selector]; // rules là function chứa các function test của các selector input
    
    // lặp qua từng rule(trong trường hợp 1 seclecttor có nhiều function test) và kiểm tra
    // nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          // funtion test
          errorMess = rules[i](
            formElement.querySelector(rule.selector + ":checked") // gọi function test theo mảng và truyền giá trị đã checked vào
          );
          break;
        default:
          errorMess = rules[i](inputElement.value); // gọi function test theo mảng và truyền giá trị value nhập vào
      }
      if (errorMess) break;
    }

    if (errorMess) {
      // gán mess vào HTML
      MessElement.innerHTML = errorMess;
      inputElement.closest(".form-group").classList.add("invalid"); // add css
    } else {
      MessElement.innerHTML = "";
      inputElement.closest(".form-group").classList.remove("invalid"); // remove css
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
        let inputElements = Array.from(
          formElement.querySelectorAll(rule.selector)
        ); //rule.selector id của form được truyền vào

        inputElements.forEach((inputElement) => {
          let isValid = validate(inputElement, rule); // function kiểm tra nếu có lỗi trả về false

          if (!isValid) {
            // neu có lỗi sẽ app thành true và ép isFormValid = false
            isFormValid = false;
          }
        });
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
            switch (input.type) {
              case "checkbox": // nếu là checkbox kiểm tra :checked tạo mảng -> thêm vào mảng
                if (input.matches(":checked")) {
                  if (Array.isArray(values[input.name])) {
                    values[input.name].push(input.value);
                  } else {
                    values[input.name] = [input.value];
                  }
                }
                break;
              case "radio": // nếu là radio kiểm tra :checked -> gán
                if (input.matches(":checked")) {
                  values[input.name] = input.value;
                }

                break;

              default: // các trường hợp điền
                values[input.name] = input.value;
            }

            return values;
          },
          {});

          option.onsubmit(formValues); // sự kiện submit
        }
      } else {
      }
    };

    option.rules.forEach((rule) => {
      // ban đầu sẽ tạo mảng nếu phần tử đó đã là mảng thì dùng push để thêm vào mảng
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        //lưu lại các rules cho mỗi input
        selectorRules[rule.selector] = [rule.test];
      }

      let inputElements = Array.from(
        formElement.querySelectorAll(rule.selector)
      ); //rule.selector id của form được truyền vào

      inputElements.forEach((inputElement) => {
        if (inputElement) {
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
        }

        // xử lý trường hợp blur vào input
        inputElement.oninput = function () {
          getErorrElement(inputElement).innerHTML = ""; // lấy thẻ cha của thẻ input đã trọn rồi chọn thẻ mess
          inputElement
            .closest(option.formGroupSelector)
            .classList.remove("invalid"); // remove css
        };
      });

      // xử lý sự kiện blur ra khỏi input
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
      return value ? undefined : mess || "Mục này là bắt buộc nhập";
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
  formGroupSelector: ".form-group",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#fullname", "Vui lòng nhập tênF"),
    Validator.isRequired("#email"),
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
    Validator.isRequired("#province", "bạn chưa chọn mục này"),
    Validator.isRequired('input[name="gender"]', "bạn chưa chọn mục này"),
    Validator.isRequired('input[name="law"]', "bạn chưa chọn mục này"),
  ], // truyền funtion vào Validator.rules

  onsubmit: function (data) {
    console.log(data);
  },
});
