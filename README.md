# Plume
pure javascript SPA library (not for production use)

#### Hello World example

```html
<!DOCTYPE html>

<head>
  <title>Hello World</title>
</head>

<body>
  <div id="app"></div>
</body>

<script src="Plume.min.js"></script>
<script>
  let app = program(model =>
    root([text("Hello World!")])
  )
</script>

</html>
```

#### Routing example
```html
<!DOCTYPE html>

<head>
  <title>Hello World</title>
</head>

<body>
  <div id="app"></div>
</body>

<script src="Plume.min.js"></script>
<script>
  let app = program(model =>
      root([
        router({
          "/fixed/1": _ =>
            root([text("fixed route #1")]),

          "/dynamic/?num": num =>
            root([text(`dynamic route [${num}]`)]),

          "*": _ =>
            root([h("404 PAGE NOT FOUND", 1)]),
        })
      ])
    )
</script>

</html>
```
