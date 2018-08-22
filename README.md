# Plume
Lightweight SPA library

#### Hello World

```html
<!DOCTYPE html>

<script src="https://cdn.rawgit.com/blkgoose/Plume/master/Plume.min.js"></script>
<script>
  Plume(model =>
    root([text("Hello World!")])
  )
</script>
```

### Data binding

```html
<!DOCTYPE html>

<script src="https://cdn.rawgit.com/blkgoose/Plume/master/Plume.min.js"></script>
<script>
  Plume(model =>
    root([
      input({
        oninput: e => model.text = e.value
      }),
      br(),
      text(`input: ${model.text || ""}`)
    ])
  )
</script>
```

#### Routing
```html
<!DOCTYPE html>

<script src="https://cdn.rawgit.com/blkgoose/Plume/master/Plume.min.js"></script>
<script>
  Plume(model =>
    router(model, {
      "/fixed/1": _ =>
        root([text("fixed route #1")]),

      "/dynamic/:num": data =>
        root([text(`dynamic route [${data.num}]`)]),

      "*": _ =>
        root([h("404 PAGE NOT FOUND", 1)]),
    })
  )
</script>
```

## Use the CDN for prototyping,
## download Plume as library and compile with Google Closure Compiler
## (non mandatory for modern browsers)

The Plume function returns the model Object of the app,
if the binding element isn't set (third parameter),
the function returns a Promise of the model.