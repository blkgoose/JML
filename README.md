# Plume
pure javascript SPA library (not for production use)

#### Hello World example

```html
<!DOCTYPE html>

<script src="Plume.min.js"></script>
<script>
  let app = Plume(model =>
    root([text("Hello World!")])
  )
</script>
```

#### Routing example
```html
<!DOCTYPE html>

<script src="Plume.min.js"></script>
<script>
  let app = Plume(model =>
      root([
        router(model, {
          "/fixed/1": _ =>
            root([text("fixed route #1")]),

          "/dynamic/?num": data =>
            root([text(`dynamic route [${data.num}]`)]),

          "*": _ =>
            root([h("404 PAGE NOT FOUND", 1)]),
        })
      ])
    )
</script>
```
