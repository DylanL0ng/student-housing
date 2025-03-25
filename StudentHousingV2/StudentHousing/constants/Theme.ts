import { createTheme } from "@rneui/themed";
const theme = createTheme({
  components: {
    Button: {
      titleStyle: {
        color: "white",
      },
      buttonStyle: {
        borderRadius: 32,
      },
    },
  },
});

export default theme;
