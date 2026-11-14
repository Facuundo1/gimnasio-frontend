import { test } from 'node:test';
import assert from 'node:assert/strict';
import { primerError, reglasCorreo, reglasPasswordLogin } from './validators.js';

test("Correo con formato válido no devuelve error", () => {
  assert.equal(primerError(reglasCorreo, "lola@gmail.com"), "");
});

test("Correo sin arroba devuelve mensaje de error", () => {
  assert.equal(
    primerError(reglasCorreo, "lolagmail.com"),
    "El correo no es válido (ejemplo: nombre@correo.com)",
  );
});

test("Correo vacío es rechazado como obligatorio", () => {
  assert.equal(primerError(reglasCorreo, ""), "Ingresá tu correo electrónico");
});

test("Contraseña de menos de 6 caracteres es rechazada en el login", () => {
  assert.equal(
    primerError(reglasPasswordLogin,"12345"),
    "La contraseña debe tener al menos 6 caracteres",
  );
});